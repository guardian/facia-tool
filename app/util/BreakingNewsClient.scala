package util

import com.gu.mobile.notifications.client._
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

class BreakingNewsClient(
  host: String,
  apiKey: String,
  ws: WSClient
) extends Logging {

  private val url = s"$host/push/topic"

  def send(request: BreakingNewsRequest)(implicit ec: ExecutionContext): Future[Either[ApiClientError, BreakingNewsResponse]] = {
    val json = Json.stringify(Json.toJson(request.payload))
    val requestBody = json.getBytes("UTF-8")
    val contentType = ContentType("application/json", "UTF-8")

    post(url, apiKey, contentType, requestBody) map {
      case error: HttpError => Left(ApiHttpError(error.status, Some(error.body)))
      case HttpOk(201, body) => validateFormat[BreakingNewsResponse](body)
      case HttpOk(code, body) => Left(UnexpectedApiResponseError(s"Server returned status code $code and body:$body"))
    } recover {
      case NonFatal(e) => Left(HttpProviderError(e))
    }
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

  def post(url: String, apiKey: String, contentType: ContentType, body: Array[Byte])(implicit ec: ExecutionContext): Future[HttpResponse] = {
    ws.url(url)
      .withHttpHeaders("Content-Type" -> s"${contentType.mediaType}; charset=${contentType.charset}", "Authorization" -> s"Bearer $apiKey")
      .post(body)
      .map(extract)
  }

  private def extract(response: WSResponse): HttpResponse = {
    if (response.status >= 200 && response.status < 300) {
      logger.info("Breaking news notification client request sent correctly")
      HttpOk(response.status, response.body)
    } else {
      logger.error(s"Unable to send breaking news client request, status ${response.status}: ${response.statusText}")
      HttpError(response.status, response.body)
    }
  }
}
