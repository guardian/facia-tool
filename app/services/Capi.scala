package services

import java.io.IOException
import java.net.{URI, URLEncoder}
import java.nio.charset.Charset
import java.time.{Period, ZoneOffset, ZonedDateTime}

import org.apache.http.client.utils.URLEncodedUtils
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.{GuardianContentClient, IAMSigner, Parameter}
import conf.ApplicationConfiguration
import model.editions.CapiPrefillQuery
import okhttp3.{Call, Callback, Request, Response}

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future, Promise}

class GuardianCapi(config: ApplicationConfiguration)(implicit ex: ExecutionContext) extends GuardianContentClient(config.contentApi.editionsKey) with Capi  {
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

  def geneneratePrefillQuery(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery) = {
    val params = URLEncodedUtils
      .parse(new URI(capiPrefillQuery.escapedQueryString()), Charset.forName("UTF-8"))
      .asScala

    // Horrible hack because composer/capi/whoever doesn't worry about timezones in the newspaper-edition date
    val localDate = issueDate.toLocalDate.atStartOfDay().toInstant(ZoneOffset.UTC)

    var query = PrintSentQuery()
      .page(1)
      .pageSize(200)
      .showFields("newspaper-edition-date")
      .showFields("newspaper-page-number")
      .showFields("internal-page-code")
      .useDate("newspaper-edition")
      .orderBy("newest")
      .fromDate(localDate)
      .toDate(localDate)

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

  def getPrefillArticlePageCodes(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[String]] = {
    this.getResponse(geneneratePrefillQuery(issueDate, capiPrefillQuery)) map { response =>
      response.results.flatMap {
        _.fields
          .flatMap(field => field.internalPageCode)
          .map(_.toString)
      }.toList
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
  def getPrefillArticlePageCodes(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[String]]
}
