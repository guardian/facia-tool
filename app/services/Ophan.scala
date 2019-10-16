package services

import java.io.IOException
import java.time.LocalDate

import conf.ApplicationConfiguration
import logging.Logging
import java.util.concurrent.TimeUnit

import com.gu.contentapi.client.model.HttpResponse
import okhttp3.{Call, Callback, ConnectionPool, OkHttpClient, Request, Response}
import okhttp3.Request.Builder
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future, Promise}

case class OphanScore(val webUrl: String, val promotionScore: Double)

class GuardianOphan(config: ApplicationConfiguration)(implicit ex: ExecutionContext) extends Ophan with Logging {

  private val ophanApiKey = "fronts-editions"

  // NEEDS CACHING!

  implicit val ophanScoreReads = Json.format[OphanScore]
  def getOphanScores(maybeUrl: Option[String], startDate: LocalDate, endDate: LocalDate): Future[Option[Array[OphanScore]]] = {
    maybeUrl match {
      case Some(url) => get(url, startDate, endDate).map(response => Json.parse(new String(response.body)).validate[Array[OphanScore]].asOpt)
      case _ => Future.successful(None)
    }
  }

  protected def httpClientBuilder = new OkHttpClient.Builder()
    .connectTimeout(1, TimeUnit.SECONDS)
    .readTimeout(2, TimeUnit.SECONDS)
    .followRedirects(true)
    .connectionPool(new ConnectionPool(10, 60, TimeUnit.SECONDS))

  protected val http = httpClientBuilder.build

  def get(url: String, startDate: LocalDate, endDate: LocalDate)(implicit context: ExecutionContext): Future[HttpResponse] = {

    val promise = Promise[HttpResponse]()

    val fromParam = startDate.toString // iso 8601
    val toParam = endDate.toString // iso 8601
    val request = new Builder().url(s"$url?from=${fromParam}&to=${toParam}&api-key=${ophanApiKey}" ).build()
    http.newCall(request).enqueue(new Callback() {
      override def onFailure(call: Call, e: IOException): Unit = promise.failure(e)

      override def onResponse(call: Call, response: Response): Unit = {
        promise.success(HttpResponse(response.body().bytes, response.code(), response.message()))
      }
    })
    promise.future
  }


}

trait Ophan {
  def getOphanScores(maybeUrl: Option[String], startDate: LocalDate, toDate: LocalDate): Future[Option[Array[OphanScore]]]
}
