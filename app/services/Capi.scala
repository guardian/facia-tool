package services

import java.io.IOException
import java.net.URI
import java.time.{Period, ZonedDateTime}

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.{GuardianContentClient, IAMSigner, Parameter}
import conf.ApplicationConfiguration
import model.editions.CapiPrefillQuery
import okhttp3.{Call, Callback, Request, Response}

import scala.concurrent.{ExecutionContext, Future, Promise}

class GuardianCapi(config: ApplicationConfiguration)(implicit ex: ExecutionContext) extends GuardianContentClient(config.contentApi.editionsKey) with Capi  {
  override def targetUrl: String = "https://preview.content.guardianapis.com"

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

  def getPrefillArticlePageCodes(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[String]] = {
    val query = PrintSentQuery()
      .page(1)
      .pageSize(10)
      .showFields("newspaper-edition-date")
      .showFields("newspaper-page-number")
      .showFields("internal-page-code")
      .useDate("newspaper-edition")
      .orderBy("newest")
      .fromDate(issueDate.minus(Period.ofDays(3)).toInstant)
      .toDate(issueDate.toInstant)
      .tag(capiPrefillQuery.tag)

    this.getResponse(query) map { response =>
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
