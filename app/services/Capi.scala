package services

import java.io.IOException
import java.net.{URI, URLEncoder}
import java.nio.charset.Charset
import java.time.{LocalDate, Period, ZoneOffset, ZonedDateTime}

import org.apache.http.client.utils.URLEncodedUtils
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.model.v1.{Content, SearchResponse, TagType}
import com.gu.contentapi.client.{GuardianContentClient, IAMEncoder, IAMSigner, Parameter}
import com.gu.facia.api.utils.{CardStyle, ResolvedMetaData}
import com.gu.facia.client.models.TrailMetaData
import conf.ApplicationConfiguration
import logging.Logging
import model.editions.CapiPrefillQuery
import okhttp3.{Call, Callback, Request, Response}

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future, Promise}

case class Prefill(
                    internalPageCode: Int,
                    showByline: Boolean,
                    showQuotedHeadline: Boolean,
                    imageCutoutReplace: Boolean,
                    cutout: Option[String]
                  )

class GuardianCapi(config: ApplicationConfiguration)(implicit ex: ExecutionContext) extends GuardianContentClient(config.contentApi.editionsKey) with Capi with Logging {
  override def targetUrl: String = config.contentApi.editionsPrefillHost

  override def get(url: String, headers: Map[String, String])(implicit context: ExecutionContext): Future[HttpResponse] = {
    val reqBuilder = this.getPreviewHeaders(url).foldLeft(new Request.Builder().url(url)) { case (builder, headerPair) =>
      builder.addHeader(headerPair._1, headerPair._2)
    }

    val req = headers.foldLeft(reqBuilder) {
      case (r, (name, value)) => r.header(name, value)
    }

    val promise = Promise[HttpResponse]()

    http.newCall(req.build()).enqueue(new Callback() {
      override def onFailure(call: Call, e: IOException): Unit = promise.failure(e)
      override def onResponse(call: Call, response: Response): Unit = {
        promise.success(HttpResponse(response.body().bytes, response.code(), response.message()))
      }
    })
    promise.future
  }

  private val previewSigner = {
    val capiPreviewCredentials = new AWSCredentialsProviderChain(
      new ProfileCredentialsProvider("capi"),
      new STSAssumeRoleSessionCredentialsProvider.Builder(config.contentApi.previewRole, "capi").build()
    )
    new IAMSigner(
      credentialsProvider = capiPreviewCredentials,
      awsRegion = config.aws.region
    )
  }

  def getPreviewHeaders(url: String): Seq[(String,String)] = previewSigner.addIAMHeaders(headers = Map.empty, URI.create(url)).toSeq

  // Prefill
  def geneneratePrefillQuery(issueDate: LocalDate, capiPrefillQuery: CapiPrefillQuery, fields: List[String]) = {
    val params = URLEncodedUtils
      .parse(new URI(capiPrefillQuery.escapedQueryString()), Charset.forName("UTF-8"))
      .asScala

    // Hack because composer/capi/whoever doesn't worry about timezones in the newspaper-edition date
    val utcMidnightOnDate = issueDate.atStartOfDay().toInstant(ZoneOffset.UTC)

    var query = PrintSentQuery()
      .page(1)
      .pageSize(200)
      .showFields(fields.mkString(","))
      .useDate("newspaper-edition") // deliberately-kebab-case
      .orderBy("newest")
      .fromDate(utcMidnightOnDate)
      .toDate(utcMidnightOnDate)

    params.filter(pair => pair.getName == "section").foreach { sectionPair =>
      query = query.section(sectionPair.getValue)
    }

    params.filter(pair => pair.getName == "tag").foreach { tagPair =>
      query = query.tag(tagPair.getValue)
    }

    params.find(pair => pair.getName == "q").foreach { queryPair =>
      query = query.q(queryPair.getValue)
    }

    query
  }

  // Sadly there's no easy way of converting a CAPI client response into JSON so we'll just proxy - similar to controllers.FaciaContentApiProxy
  def getPrefillArticles(issueDate: LocalDate, capiPrefillQuery: CapiPrefillQuery, currentPageCodes: List[String]): Future[SearchResponse] = {
    val fields = List(
      "newspaperEditionDate",
      "newspaperPapeNumber",
      "internalPageCode",
      "isLive",
      "firstPublicationDate",
      "headline",
      "trailText",
      "byline",
      "thumbnail",
      "secureThumbnail",
      "liveBloggingNow",
      "membershipAccess",
      "shortUrl"
    )

    val query = geneneratePrefillQuery(issueDate, capiPrefillQuery, fields)
      .showElements("images")
      .showTags("all")
      .showBlocks("main")
      .showAtoms("media")

    this.getResponse(query).map { response =>
      val filteredResults = response.results.filter { result =>
        (for {
          fields <- result.fields
          pageCode <- fields.internalPageCode
        } yield !currentPageCodes.contains(pageCode.toString))
          .getOrElse(true)
      }

      response.copy(
        total = filteredResults.length,
        results = filteredResults
      )
    }
  }

  /**
    * Get a list of article items in the order they exist according to the newspaper page number
    * @param issueDate
    * @param capiPrefillQuery
    * @return
    */
  def getPrefillArticleItems(issueDate: LocalDate, capiPrefillQuery: CapiPrefillQuery): Future[List[Prefill]] = {
    val fields = List(
      "newspaperEditionDate",
      "newspaperPageNumber",
      "internalPageCode"
    )

    val query = geneneratePrefillQuery(issueDate, capiPrefillQuery, fields)
      .showTags("all")

    this.getResponse(query) map { response =>
      response.results
        .map { content =>
          val newspaperPageNumber = content.fields.flatMap(_.newspaperPageNumber)
          val prefill = prefillMetadata(content)
          (newspaperPageNumber, prefill)
        }
        .collect {
          case (Some(internalPageCode), Some(metadata)) => (internalPageCode.toString, metadata)
        }
        .sortBy {
          case (pageNumber, _) => pageNumber
        }
        .map {
          case (_, metaData) => metaData
        }
        .toList
    }
  }

  private def prefillMetadata(content: Content): Option[Prefill] = {
    val maybeInternalPageCode = content.fields.flatMap(_.internalPageCode)
    maybeInternalPageCode.map { internalPageCode =>
      val cardStyle = CardStyle(content, TrailMetaData.empty)
      val metadata = ResolvedMetaData.fromContent(content, cardStyle)
      val maybeCutout = if (metadata.imageCutoutReplace) {
        content.tags
          .filter(_.`type` == TagType.Contributor)
          .flatMap(_.bylineLargeImageUrl)
          .headOption
      } else None
      Prefill(internalPageCode, metadata.showByline, metadata.showQuotedHeadline, metadata.imageCutoutReplace, maybeCutout)
    }
  }
}

// Query generator for the print-sent endpoint
case class PrintSentQuery(parameterHolder: Map[String, Parameter] = Map.empty)
  extends SearchQueryBase[PrintSentQuery] {

  def withParameters(parameterMap: Map[String, Parameter]) = copy(parameterMap)

  override def pathSegment: String = "content/print-sent"
}

trait Capi {
  def getPreviewHeaders(url: String): Seq[(String,String)]
  def getPrefillArticleItems(issueDate: LocalDate, capiPrefillQuery: CapiPrefillQuery): Future[List[Prefill]]
  def getPrefillArticles(issueDate: LocalDate, capiPrefillQuery: CapiPrefillQuery, currentPageCodes: List[String]): Future[SearchResponse]
}
