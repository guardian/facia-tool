package model.packages

import logging.Logging
import model.editions.{CoverCardImages, FeastCollectionTheme, Image, MediaType}
import play.api.libs.json._

sealed trait PackageMetadata

case class FeastPackageMetadata(
    theme: Option[FeastCollectionTheme] = None,
    bodyText: Option[String] = None,
    targetedRegions: Option[Seq[String]] = None,
    excludedRegions: Option[Seq[String]] = None
) extends PackageMetadata

object FeastPackageMetadata extends Logging {
  implicit val format: OFormat[FeastPackageMetadata] =
    Json.format[FeastPackageMetadata]

  def fromJson(str: Option[String]) =
    str.map(Json.parse).map(_.validate[FeastPackageMetadata])
}

case class StoryPackageMetadata(
    headline: Option[String]
    // Fill this in when we know what they are! We need to have at least one field to satisfy the compiler
) extends PackageMetadata

object StoryPackageMetadata {
  implicit val format: OFormat[StoryPackageMetadata] =
    Json.format[StoryPackageMetadata]

  def fromJson(str: Option[String]) =
    str.map(Json.parse).map(_.validate[StoryPackageMetadata])
}
