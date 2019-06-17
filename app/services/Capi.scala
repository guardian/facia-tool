package services

import java.net.{URI, URLEncoder}
import java.nio.charset.StandardCharsets
import java.time.{Period, ZonedDateTime}

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.{GuardianContentClient, IAMSigner, Parameter}
import conf.ApplicationConfiguration
import model.editions.CapiPrefillQuery

import scala.concurrent.{ExecutionContext, Future}

class GuardianPreviewContentClient(apiKey: String) extends GuardianContentClient(apiKey) {
  override def targetUrl: String = "https://preview.content.guardianapis.com"
}

case class PrintSentQuery(parameterHolder: Map[String, Parameter] = Map.empty)
  extends SearchQueryBase[PrintSentQuery] {

  def withParameters(parameterMap: Map[String, Parameter]) = copy(parameterMap)

  override def pathSegment: String = "content/print-sent"
}

class Capi(config: ApplicationConfiguration)(implicit ex: ExecutionContext) {
  val client = new GuardianPreviewContentClient("teleporter-view")

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

  def getPrefillArticles(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery) = {
    // Commenting this out so we can get this merged without prefill working
    Future.successful(Nil)

    //val query = PrintSentQuery()
    //  .page(1)
    //  .pageSize(10)
    //  .showFields("newspaper-edition-date")
    //  .showFields("newspaper-page-number")
    //  .showFields("internal-page-code")
    //  .useDate("newspaper-edition")
    //  .orderBy("newest")
    //  .fromDate(issueDate.minus(Period.ofDays(3)).toInstant)
    //  .toDate(issueDate.toInstant)

    //client.getResponse(query) map { response =>
    //  response.results.map {
    //    _.id
    //  }
    //}
  }
}
