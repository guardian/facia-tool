package model.forms

import play.api.libs.json.OFormat
import play.api.libs.json.Json

case class MoveCollection(newIndex: Int)

object MoveCollection {
  implicit val formats: OFormat[MoveCollection] = Json.format[MoveCollection]
}
