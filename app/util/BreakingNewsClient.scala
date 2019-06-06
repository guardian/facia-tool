package util

import com.gu.mobile.notifications.client.models.{BreakingNewsPayload, Topic}
import logging.Logging
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}
import play.api.libs.ws.{WSClient, WSResponse}
import updates.ClientHydratedTrail

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

case class BreakingNewsRequest(trail: ClientHydratedTrail, topic: Topic, payload: BreakingNewsPayload)

case class BreakingNewsResponse(id: String)

object BreakingNewsResponse {
  implicit val jf = Json.format[BreakingNewsResponse]
}

sealed trait BreakingNewsError
case class BreakingNewsResponseStatusError(status: Int, body: String) extends BreakingNewsError
case class BreakingNewsResponseFormatError(error: Either[String, Exception], body: String) extends BreakingNewsError
case class BreakingNewsResponseException(err: Exception) extends BreakingNewsError
case class BreakingNewsSuppressedError(message: String) extends BreakingNewsError

object BreakingNewsError {
  def getDescription(error: BreakingNewsError): String = error match {
    case BreakingNewsResponseStatusError(status, body) => s"Unexpected HTTP status $status: $body"
    case BreakingNewsResponseFormatError(Left(description), body) => s"Format error in response $description: $body"
    case BreakingNewsResponseFormatError(Right(err), body) => s"Format error in response: ${err.getMessage}: $body"
    case BreakingNewsResponseException(err) => s"Unexpected error ${err.getMessage}"
    case BreakingNewsSuppressedError(message) => message
  }

  def getException(error: BreakingNewsError): Option[Exception] = error match {
    case BreakingNewsResponseFormatError(Right(err), _) => Some(err)
    case BreakingNewsResponseException(err) => Some(err)
    case _ => None
  }
}

class BreakingNewsClient(
  host: String,
  apiKey: String,
  ws: WSClient
) extends Logging {

  private val url = s"$host/push/topic"

  def send(request: BreakingNewsRequest)(implicit ec: ExecutionContext): Future[Either[BreakingNewsError, BreakingNewsResponse]] = {
    val json = Json.stringify(Json.toJson(request.payload))
    val requestBody = json.getBytes("UTF-8")

    post(url, apiKey, requestBody) map { response =>
      if(response.status == 201) {
        validateFormat[BreakingNewsResponse](response.body)
      } else {
        Left(BreakingNewsResponseStatusError(response.status, response.body))
      }
    } recover {
      case NonFatal(e: Exception) => Left(BreakingNewsResponseException(e))
    }
  }

  private def validateFormat[T](jsonBody: String)(implicit jr: Reads[T]): Either[BreakingNewsError, T] = {
    try {
      Json.parse(jsonBody).validate[T] match {
        case JsSuccess(r, _) =>
          Right(r)

        case JsError(errors) =>
          val description = errors.flatMap(_._2.map(_.message)).mkString(", ")
          Left(BreakingNewsResponseFormatError(Left(description), jsonBody))
      }
    }
    catch {
      case NonFatal(e: Exception) =>
        Left(BreakingNewsResponseFormatError(Right(e), jsonBody))
    }
  }

  def post(url: String, apiKey: String, body: Array[Byte])(implicit ec: ExecutionContext): Future[WSResponse] = {
    ws.url(url)
      .withHttpHeaders("Content-Type" -> s"application/json; charset=UTF-8", "Authorization" -> s"Bearer $apiKey")
      .post(body)
      .map { response =>
        logger.info(s"Breaking news client received response ${response.status}: ${response.body}")
        response
      }
  }
}
