package model.forms

import play.api.libs.json.Json

case class GetCollectionsFilter(id: String, lastUpdated: Option[Long])

object GetCollectionsFilter {
  implicit val format = Json.format[GetCollectionsFilter]
}

