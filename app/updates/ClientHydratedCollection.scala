package updates

import play.api.libs.json.Json

case class ClientHydratedTrail (
  topic: Option[String],
  headline: String,
  group: Option[String],
  isArticle: Boolean,
  thumb: Option[String],
  image: Option[String],
  imageHide: Option[Boolean],
  path: Option[String],
  shortUrl: Option[String],
  alert: Option[Boolean],
  blockId: Option[String]
) {}
object ClientHydratedTrail {
  implicit val jsonFormat = Json.format[ClientHydratedTrail]
}

case class ClientHydratedCollection (
  trails: List[ClientHydratedTrail]
) {}
object ClientHydratedCollection {
  implicit val jsonFormat = Json.format[ClientHydratedCollection]
}
