package util

import com.gu.mobile.notifications.client._
import com.gu.mobile.notifications.client.models.{BreakingNewsPayload, Topic}
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}
import updates.ClientHydratedTrail

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

case class BreakingNewsRequest(trail: ClientHydratedTrail, topic: Topic, payload: BreakingNewsPayload)
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

  def send(request: BreakingNewsRequest)(implicit ec: ExecutionContext): Future[Either[ApiClientError, BreakingNewsResponse]] = {
    val json = Json.stringify(Json.toJson(request.payload))
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
