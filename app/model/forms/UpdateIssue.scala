package model.forms

import play.api.libs.json.Json
//import model.editions.EditionsCollection
import model.editions._

case class UpdateIssue(collection: EditionsCollection)

object UpdateIssue {
  implicit val format = Json.format[UpdateIssue]
}

