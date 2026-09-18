package model.packages.client

import org.apache.pekko.util.ByteString
import play.api.libs.json._
import play.api.http.Writeable

import java.nio.charset.StandardCharsets
case class ErrorResponse(status: String, detail: String)

object ErrorResponse {
  implicit val format: OFormat[ErrorResponse] = Json.format[ErrorResponse]
  implicit val writable: Writeable[ErrorResponse] =
    new Writeable[ErrorResponse](
      value =>
        ByteString(
          Json.toJson(value).toString().getBytes(StandardCharsets.UTF_8)
        ),
      contentType = Some("application/json;charset=utf-8")
    )
  def apply(detail: String) = new ErrorResponse("error", detail)
  def conflict(detail: String) = new ErrorResponse("conflict", detail)
  def badRequest(detail: String) = new ErrorResponse("bad_request", detail)
  def notFound(detail: String) = new ErrorResponse("not_found", detail)
}
