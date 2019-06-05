package util

import java.util.UUID

import com.gu.mobile.notifications.client._
import com.gu.mobile.notifications.client.models.{BreakingNewsPayload, NotificationPayload, Topic}
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import scala.util.{Failure, Success}

case class BreakingNewsResponse(id: String)

object BreakingNewsResponse {
  implicit val jf = Json.format[BreakingNewsResponse]
}

class BreakingNewsClient(
  val host: String,
  val apiKey: String,
  val httpProvider: HttpProvider,
  val clientId: String = "nextGen"
) {

  private val url = s"$host/push/topic"

  def send(notificationPayload: BreakingNewsPayload)(implicit ec: ExecutionContext): Future[List[Either[ApiClientError, BreakingNewsResponse]]] = {
    Future.traverse(notificationPayload.topic) { topic =>
      // We send a Global notification as multiple notifications to each requested topic
      // This is because there is a limit of 3 topics at once in mobile-n10n and we currently have 4 global editions
      val payload = notificationPayload.copy(topic = List(topic), id = UUID.randomUUID())
      doSend(payload, topic)
    }
  }

  private def doSend(payload: BreakingNewsPayload, topic: Topic)(implicit ec: ExecutionContext): Future[Either[ApiClientError, BreakingNewsResponse]] = {
    val json = Json.stringify(Json.toJson(payload))
    postJson(url, json) map {
      case error: HttpError => Left(ApiHttpError(error.status, Some(error.body)))
      case HttpOk(201, body) => validateFormat[BreakingNewsResponse](body)
      case HttpOk(code, body) => Left(UnexpectedApiResponseError(s"Server returned status code $code and body:$body"))
    } recover {
      case NonFatal(e) => Left(HttpProviderError(e))
    }
  }

  private def postJson(destUrl: String, json: String) = {
    httpProvider.post(
      url = destUrl,
      apiKey = apiKey,
      contentType = ContentType("application/json", "UTF-8"),
      body = json.getBytes("UTF-8")
    )
  }

  private def validateFormat[T](jsonBody: String)(implicit jr: Reads[T]): Either[ApiClientError, T] = {
    try {
      Json.parse(jsonBody).validate[T] match {
        case JsSuccess(r, _) => Right(r)
        case _: JsError => Left(UnexpectedApiResponseError(jsonBody))
      }
    }
    catch {
      case NonFatal(_) => Left(UnexpectedApiResponseError(jsonBody))
    }
  }
}
