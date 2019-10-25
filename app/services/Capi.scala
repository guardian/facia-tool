package services

import java.io.IOException
import java.net.URI
import java.nio.charset.Charset

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import com.gu.contentapi.client.{GuardianContentClient, IAMSigner, Parameter}
import conf.ApplicationConfiguration
import logging.Logging
import logic.CapiPrefiller
import model.editions._
import okhttp3.{Call, Callback, Request, Response}
import org.apache.http.client.utils.URLEncodedUtils
import services.editions.prefills.{Prefill, PrefillParamsAdapter}

import scala.concurrent.{ExecutionContext, Future, Promise}

class GuardianCapi(config: ApplicationConfiguration)(implicit ex: ExecutionContext)
  extends GuardianContentClient(apiKey = config.contentApi.editionsKey) with Capi with Logging {

  override def targetUrl: String = config.contentApi.contentApiDraftHost

  override def get(url: String, headers: Map[String, String])(implicit context: ExecutionContext): Future[HttpResponse] = {
    val reqBuilder = getPreviewHeaders(headers, url).foldLeft(new Request.Builder().url(url)) { case (builder, headerPair) =>
      val (headerName, headerValue) = headerPair
      builder.addHeader(headerName, headerValue)
    }

    val promise = Promise[HttpResponse]()

    http.newCall(reqBuilder.build()).enqueue(new Callback() {
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

  def getPreviewHeaders(headers: Map[String, String], url: String): Seq[(String, String)] = previewSigner.addIAMHeaders(headers = headers, URI.create(url)).toSeq


  // Sadly there's no easy way of converting a CAPI client response into JSON so we'll just proxy - similar to controllers.FaciaContentApiProxy
  def getPrefillArticles(getPrefill: PrefillParamsAdapter, currentPageCodes: List[String]): Future[SearchResponse] = {

    val query = GuardianCapi.prepareGetPrefillArticlesQuery(getPrefill, currentPageCodes)

    logger.info(s"getPrefillArticles, Prefill Query: $query for ${getPrefill.metadataForLogging}")

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
   *
   * @param getPrefillParams
   * @return
   */
  def getUnsortedPrefillArticleItems(getPrefillParams: PrefillParamsAdapter): Future[List[Prefill]] = {

    val query = GuardianCapi.prepareGetUnsortedPrefillArticleItemsQuery(getPrefillParams)

    logger.info(s"getUnsortedPrefillArticleItems, Prefill Query: $query for ${getPrefillParams.metadataForLogging}")

    this.getResponse(query) map { response =>
      response.results.flatMap(content => prefillMetadata(content)).toList
    }
  }

  private def prefillMetadata(content: Content): Option[Prefill] = {
    content.fields.flatMap(_.internalPageCode).map { internalPageCode => CapiPrefiller.prefill(content) }
  }
}

object GuardianCapi extends Logging {

  import scala.collection.JavaConverters._

  def prepareGetUnsortedPrefillArticleItemsQuery(getPrefillParams: PrefillParamsAdapter): CapiQueryGenerator = {
    val fields = List(
      "newspaperEditionDate",
      "newspaperPageNumber",
      "internalPageCode"
    )

    geneneratePrefillQuery(getPrefillParams, fields).showTags("all")
  }

  def prepareGetPrefillArticlesQuery(getPrefill: PrefillParamsAdapter, currentPageCodes: List[String]): CapiQueryGenerator = {

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

    geneneratePrefillQuery(getPrefill, fields)
      .showElements("images")
      .showTags("all")
      .showBlocks("main")
      .showAtoms("media")
  }

  private def geneneratePrefillQuery(getPrefillParams: PrefillParamsAdapter, fields: List[String]): CapiQueryGenerator = {

    import getPrefillParams._

    val params = URLEncodedUtils
      .parse(new URI(contentPrefillUrlSegments.escapedQueryString()), Charset.forName("UTF-8"))
      .asScala

    import contentPrefillTimeWindow.{fromDate, toDate}

    var query = CapiQueryGenerator(contentPrefillUrlSegments.pathType)
      .page(1)
      .pageSize(200)
      .showFields(fields.mkString(","))
      .useDate("newspaper-edition") // deliberately-kebab-case
      .orderBy("newest")
      .fromDate(fromDate)
      .toDate(toDate)

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

}

case class CapiQueryGenerator(pathType: PathType, parameterHolder: Map[String, Parameter] = Map.empty)
  extends SearchQueryBase[CapiQueryGenerator] {

  def withParameters(parameterMap: Map[String, Parameter]) = copy(pathType, parameterMap)

  override def pathSegment: String = pathType.toPathSegment
}

trait Capi {
  def getPreviewHeaders(headers: Map[String, String], url: String): Seq[(String, String)]

  def getUnsortedPrefillArticleItems(prefillParams: PrefillParamsAdapter): Future[List[Prefill]]

  def getPrefillArticles(prefillParams: PrefillParamsAdapter, currentPageCodes: List[String]): Future[SearchResponse]
}
