package model.packages

import logging.Logging
import model.editions.{CoverCardImages, FeastCollectionTheme, Image, MediaType}
import model.packages.Package.PackageType
import model.packages.Package.PackageType.{Feast, Story}
import play.api.libs.json._

sealed trait PackageMetadata {
  val packageType: PackageType
  def toJson: JsObject
}

case class FeastPackageMetadata(
    theme: Option[FeastCollectionTheme] = None,
    bodyText: Option[String] = None,
    targetedRegions: Option[Seq[String]] = None,
    excludedRegions: Option[Seq[String]] = None
) extends PackageMetadata {
  override val packageType: PackageType = Feast
  def toJson = FeastPackageMetadata.format.writes(this)
}

object FeastPackageMetadata extends Logging {
  implicit val format: OFormat[FeastPackageMetadata] =
    Json.format[FeastPackageMetadata]

  def fromJson(str: Option[String]) =
    str.map(Json.parse).map(_.validate[FeastPackageMetadata])
}

case class StoryPackageMetadata(
    headline: Option[String]
    // Fill this in when we know what they are! We need to have at least one field to satisfy the compiler
) extends PackageMetadata {
  override val packageType = Story
  def toJson = StoryPackageMetadata.format.writes(this)
}

object StoryPackageMetadata {
  implicit val format: OFormat[StoryPackageMetadata] =
    Json.format[StoryPackageMetadata]

  def fromJson(str: Option[String]) =
    str.map(Json.parse).map(_.validate[StoryPackageMetadata])
}

object PackageMetadata extends MetadataHelpers {
  implicit val format: OFormat[PackageMetadata] = new OFormat[PackageMetadata] {
    override def writes(o: PackageMetadata): JsObject = o match {
      case f: FeastPackageMetadata => FeastPackageMetadata.format.writes(f)
      case s: StoryPackageMetadata => StoryPackageMetadata.format.writes(s)
    }

    override def reads(json: JsValue): JsResult[PackageMetadata] =
      selectByPackageType(json \ "packageType") {
        case Feast => FeastPackageMetadata.format.reads(json)
        case Story => StoryPackageMetadata.format.reads(json)
      }
  }
}
