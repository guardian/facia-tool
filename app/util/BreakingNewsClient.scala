package util

import java.util.UUID

import com.gu.mobile.notifications.client._
import com.gu.mobile.notifications.client.models.{BreakingNewsPayload, NotificationPayload, Topic}
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}

import scala.concurrent.{ExecutionContext, Future}

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

  def send(notificationPayload: NotificationPayload)(implicit ec: ExecutionContext): Future[Either[ApiClientError, Unit]] = {

    def doSend(payload: NotificationPayload): Future[Either[ApiClientError, Unit]] = {
      val json = Json.stringify(Json.toJson(payload))
      postJson(url, json) map {
        case error: HttpError => Left(ApiHttpError(error.status, Some(error.body)))
        case HttpOk(201, body) => validateFormat[BreakingNewsResponse](body)
        case HttpOk(code, body) => Left(UnexpectedApiResponseError(s"Server returned status code $code and body:$body"))
      } recover {
        case e: Exception => Left(HttpProviderError(e))
      }
    }

    def doSendOncePerTopic(payload: BreakingNewsPayload): Future[Either[ApiClientError, Unit]] = {
      val results = payload.topic
        .map(topic => payload.copy(topic = List(topic), id = UUID.randomUUID()))
        .map(doSend)
      Future.sequence(results).map { responses =>
        responses.collect { case Left(error) => error } match {
          case Nil => Right(())
          case onlyOneError :: Nil => Left(onlyOneError)
          case errors: List[ApiClientError] => Left(UnexpectedApiResponseError(errors.map(_.description).mkString(", ")))
        }
      }
    }

    notificationPayload match {
      case breakingNews: BreakingNewsPayload if breakingNews.topic.size > 1 => doSendOncePerTopic(breakingNews)
      case _ => doSend(notificationPayload)
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

  private def validateFormat[T](jsonBody: String)(implicit jr: Reads[T]): Either[ApiClientError, Unit] = {
    try {
      Json.parse(jsonBody).validate[T] match {
        case _: JsSuccess[T] => Right(())
        case _: JsError => Left(UnexpectedApiResponseError(jsonBody))
      }
    }
    catch {
      case _: Exception => Left(UnexpectedApiResponseError(jsonBody))
    }
  }
}
