package model.packages

import model.editions.FeastCollectionTheme
import play.api.libs.json._

case class FeastPackageMetadata(
    theme: Option[FeastCollectionTheme] = None,
    targetedRegions: Option[Seq[String]] = None,
    excludedRegions: Option[Seq[String]] = None
)

object FeastPackageMetadata {
  implicit val format: OFormat[FeastPackageMetadata] =
    Json.format[FeastPackageMetadata]
}
