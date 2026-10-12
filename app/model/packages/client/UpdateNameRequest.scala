package model.packages.client

import play.api.libs.json.{Json, OFormat}

case class UpdateNameRequest(name: String)

object UpdateNameRequest {
  implicit val format: OFormat[UpdateNameRequest] =
    Json.format[UpdateNameRequest]
}
