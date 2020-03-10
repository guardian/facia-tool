package model.forms

import play.api.libs.json.{Json, OFormat}

case class CollectionRenameRequest(
  id: String,
  displayName: String
)

object CollectionRenameRequest {
  implicit val format: OFormat[CollectionRenameRequest] = Json.format[CollectionRenameRequest]
}
