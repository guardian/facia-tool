package slices

import play.api.libs.json.{Json, OFormat}

object ContainerJsonConfig {
  implicit val jsonFormat: OFormat[ContainerJsonConfig] =
    Json.format[ContainerJsonConfig]
}

case class ContainerJsonConfig(
    name: String,
    groups: Option[Seq[String]]
)
