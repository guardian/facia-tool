package model.packages.client

import play.api.libs.json._

case class UpdateRegionsRequest(
    targetedRegions: Option[Seq[String]],
    excludedRegions: Option[Seq[String]]
)

object UpdateRegionsRequest {
  implicit val formats: OFormat[UpdateRegionsRequest] =
    Json.format[UpdateRegionsRequest]
}
