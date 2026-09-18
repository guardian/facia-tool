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
    new OFormat[FeastPackageMetadata] {
      private val allowedKeys =
        Set("theme", "bodyText", "targetedRegions", "excludedRegions")
      override def writes(o: FeastPackageMetadata): JsObject =
        Json.writes[FeastPackageMetadata].writes(o)

      override def reads(json: JsValue): JsResult[FeastPackageMetadata] =
        json match {
          case obj: JsObject =>
            val extraKeys = obj.keys.diff(allowedKeys)
            if (extraKeys.nonEmpty) {
              JsError(s"Unexpected field(s): ${extraKeys.mkString(", ")}")
            } else {
              Json.reads[FeastPackageMetadata].reads(obj)
            }
          case _ => JsError("Expected a JSON object")
        }
    }
}

case class WebPackageMetadata(
    // just examples at the moment
    headline: Option[String],
    customKicker: Option[String]
) extends PackageMetadata //TBD

object WebPackageMetadata {
  implicit val format: OFormat[WebPackageMetadata] =
    new OFormat[WebPackageMetadata] {
      private val allowedKeys = Set("headline", "customKicker")
      override def writes(o: WebPackageMetadata): JsObject =
        Json.writes[WebPackageMetadata].writes(o)

      override def reads(json: JsValue): JsResult[WebPackageMetadata] =
        json match {
          case obj: JsObject =>
            val extraKeys = obj.keys.diff(allowedKeys)
            if (extraKeys.nonEmpty) {
              JsError(s"Unexpected field(s): ${extraKeys.mkString(", ")}")
            } else {
              Json.reads[WebPackageMetadata].reads(obj)
            }
          case _ => JsError("Expected a JSON object")
        }
    }
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
