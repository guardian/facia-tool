package model.packages.client

import play.api.libs.json.JsValue
import play.api.libs.json.{Json, OFormat}

case class CreatePackageRequest(
    id: String,
    name: String,
    isHidden: Boolean,
    webMetadata: Option[JsValue],
    feastMetadata: Option[JsValue],
    prefill: Option[String],
    createdOn: Long,
    createdBy: String,
    createdEmail: String
)

object CreatePackageRequest {
  implicit val format: OFormat[CreatePackageRequest] =
    Json.format[CreatePackageRequest]
}
