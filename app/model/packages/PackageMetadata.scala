package model.packages

import model.editions.{CoverCardImages, FeastCollectionTheme, Image, MediaType}
import play.api.libs.json._

sealed trait PackageMetadata

case class FeastPackageMetadata(
    theme: Option[FeastCollectionTheme] = None,
    bodyText: Option[String] = None,
    targetedRegions: Option[Seq[String]] = None,
    excludedRegions: Option[Seq[String]] = None
) extends PackageMetadata

object FeastPackageMetadata {
  implicit val format: OFormat[FeastPackageMetadata] =
    Json.format[FeastPackageMetadata]
}

case class WebPackageMetadata(
    // just examples at the moment
    headline: Option[String],
    customKicker: Option[String]
) extends PackageMetadata //TBD

object WebPackageMetadata {
  implicit val format: OFormat[WebPackageMetadata] =
    Json.format[WebPackageMetadata]
}

object PackageMetadata {
  implicit val format: OFormat[PackageMetadata] = new OFormat[PackageMetadata] {
    override def writes(o: PackageMetadata): JsObject = o match {
      case f: FeastPackageMetadata => FeastPackageMetadata.format.writes(f)
      case w: WebPackageMetadata   => WebPackageMetadata.format.writes(w)
    }

    override def reads(json: JsValue): JsResult[PackageMetadata] = {
      FeastPackageMetadata.format.reads(json) orElse WebPackageMetadata.format
        .reads(json)
    }
  }
}
