package model.forms

import play.api.libs.json.{Json, OFormat}

import java.time.ZonedDateTime
import java.util.UUID

final case class GetPackagesFilter(
    id: Option[UUID],
    lastModified: Option[ZonedDateTime],
    lastModifiedStrict: Boolean = false
)

object GetPackagesFilter {
  implicit val format: OFormat[GetPackagesFilter] =
    Json.format[GetPackagesFilter]
}
