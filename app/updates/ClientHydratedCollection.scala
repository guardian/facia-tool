package updates

import play.api.libs.json.Json

case class ClientHydratedTrail (
  topic: Option[String],
  headline: String,
  group: Option[String],
  isArticle: Boolean,
  thumb: Option[String],
  image: Option[String],
  path: Option[String],
  shortUrl: Option[String],
  alert: Option[Boolean]
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
