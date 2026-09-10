package services

import java.io.IOException
import java.time.LocalDate
import conf.ApplicationConfiguration
import logging.Logging

import java.util.concurrent.TimeUnit
import com.github.blemale.scaffeine.{Cache, Scaffeine}
import com.gu.contentapi.client.model.HttpResponse
import model.editions.OphanQueryPrefillParams
import okhttp3.{Call, Callback, ConnectionPool, OkHttpClient, Response}
import okhttp3.Request.Builder
import play.api.libs.json.{Json, OFormat}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, Promise}

case class OphanScore(capiId: String, promotionScore: Double)

class GuardianOphan(config: ApplicationConfiguration)(implicit
    ex: ExecutionContext
) extends Ophan
    with Logging {

  val DEFAULT_OPHAN_ADDRESS = "https://api.ophan.co.uk/api"
  val promotionPath = "/promotion/front/"
  implicit val ophanScoreReads: OFormat[OphanScore] = Json.format[OphanScore]

  def getOphanScores(
      maybePath: Option[String],
      baseDate: LocalDate,
      maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
  ): Future[Option[Array[OphanScore]]] = {
    val maybeDates = maybeOphanQueryPrefillParams.map(ophanQueryPrefillParams =>
      (
        baseDate.plusDays(ophanQueryPrefillParams.timeWindowConfig.startOffset),
        baseDate.plusDays(ophanQueryPrefillParams.timeWindowConfig.endOffset)
      )
    )
    val apiKey = maybeOphanQueryPrefillParams match {
      case Some(params) => params.apiKey // template specific key
      case None         =>
        config.ophanApi.key match {
          case Some(key) => key // application specific key
          case None => "fronts" // fallback, hopefully mostly for dev purposes
        }
    }

    val host = config.ophanApi.host.getOrElse(DEFAULT_OPHAN_ADDRESS)
    (maybePath, maybeDates) match {
      case (Some(path), Some((fromDate, toDate))) =>
        get(host, path, fromDate, toDate, apiKey).map(response =>
          Json
            .parse(new String(response.body))
            .validate[Array[OphanScore]]
            .asOpt
        )
      case _ => Future.successful(None)
    }
  }

  protected def httpClientBuilder = new OkHttpClient.Builder()
    .connectTimeout(1, TimeUnit.SECONDS)
    .readTimeout(2, TimeUnit.SECONDS)
    .followRedirects(true)
    .connectionPool(new ConnectionPool(10, 60, TimeUnit.SECONDS))

  protected val http = httpClientBuilder
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .build

  private val cache: Cache[String, Future[HttpResponse]] =
    Scaffeine()
      .recordStats()
      .expireAfterWrite(10.minute)
      .maximumSize(50)
      .build((url: String) => getRequest(url))

  private def get(
      host: String,
      path: String,
      startDate: LocalDate,
      endDate: LocalDate,
      ophanApiKey: String
  )(implicit context: ExecutionContext): Future[HttpResponse] = {
    val fromParam = startDate.toString // iso 8601
    val toParam = endDate.toString // iso 8601
    val url =
      s"$host$promotionPath$path?from=${fromParam}&to=${toParam}&api-key=${ophanApiKey}"
    cache.get(url, getRequest)
  }

  private def getRequest(url: String) = {
    val request = new Builder().url(url).build()
    logger.info(s"Getting promotion data from ophan (${request.url()}")
    val promise = Promise[HttpResponse]()
    http
      .newCall(request)
      .enqueue(new Callback() {
        override def onFailure(call: Call, e: IOException): Unit =
          promise.failure(e)

        override def onResponse(call: Call, response: Response): Unit = {
          promise.success(
            HttpResponse(
              response.body().bytes,
              response.code(),
              response.message()
            )
          )
        }
      })
    promise.future
  }
}

trait Ophan {
  def getOphanScores(
      maybePath: Option[String],
      baseDate: LocalDate,
      maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
  ): Future[Option[Array[OphanScore]]]
}
