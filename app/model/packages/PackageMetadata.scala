package model.packages

import model.editions.{CoverCardImages, FeastCollectionTheme, Image, MediaType}
import play.api.libs.json._

sealed trait PackageMetadata

case class FeastPackageMetadata(
    theme: Option[FeastCollectionTheme] = None,
    targetedRegions: Option[Seq[String]] = None,
    excludedRegions: Option[Seq[String]] = None
) extends PackageMetadata

object FeastPackageMetadata {
  implicit val format: OFormat[FeastPackageMetadata] =
    Json.format[FeastPackageMetadata]
}

case class WebPackageMetadata(
    // currently synced with EditionsArticleMetadata
    headline: Option[String],
    customKicker: Option[String],
    trailText: Option[String],
    showQuotedHeadline: Option[Boolean],
    showByline: Option[Boolean],
    byline: Option[String],
    sportScore: Option[String],
    mediaType: Option[MediaType],

    // keep overrides even if not used so user can switch back w/out needing to re-crop
    cutoutImage: Option[Image],
    replaceImage: Option[Image],
    overrideArticleMainMedia: Option[Boolean],
    coverCardImages: Option[CoverCardImages],
    promotionMetric: Option[Double]
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
