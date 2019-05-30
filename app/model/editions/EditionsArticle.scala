package model.editions

import play.api.libs.json.Json

case class EditionsArticle(path: String)

object EditionsArticle {
  implicit val writes = Json.writes[EditionsArticle]
}
