package model.forms

import play.api.libs.json.{Json, OFormat}

case class GetCollectionsFilter(id: String, lastUpdated: Option[Long])

object GetCollectionsFilter {
  implicit val format: OFormat[GetCollectionsFilter] =
    Json.format[GetCollectionsFilter]
}
