package model.forms

import play.api.libs.json.Json
import model.editions._

case class UpdateIssue(collection: EditionsFrontendCollectionWrapper)

object UpdateIssue {
  implicit val format = Json.format[UpdateIssue]
}

