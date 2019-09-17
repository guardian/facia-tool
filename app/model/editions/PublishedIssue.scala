package model.editions

import java.time.{LocalDate, OffsetDateTime}

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}

// TODO traitify PublishedItem - when we have more than one type of collection item

sealed abstract class PublishedMediaType extends EnumEntry with Uncapitalised
object PublishedMediaType extends PlayEnum[PublishedMediaType] {
  case object UseArticleTrail extends PublishedMediaType
  case object Hide extends PublishedMediaType
  case object Cutout extends PublishedMediaType
  case object Image extends PublishedMediaType
  case object CoverCard extends PublishedMediaType

  override def values = findValues
}

case class PublishedImage(height: Option[Int], width: Option[Int], src: String)

case class PublishedCardImage(mobile: PublishedImage, tablet: PublishedImage)

case class PublishedFurniture(
  kicker: Option[String],
  headlineOverride: Option[String],
  trailTextOverride: Option[String],
  bylineOverride: Option[String],
  showByline: Boolean,
  showQuotedHeadline: Boolean,
  mediaType: PublishedMediaType,
  imageSrcOverride: Option[PublishedImage],
  sportScore: Option[String],
  overrideArticleMainMedia: Boolean,
  coverCardImages: Option[PublishedCardImage]
)

case class PublishedArticle(internalPageCode: Long, furniture: PublishedFurniture)

object PublishedArticle {
  val SHOW_BYLINE_DEFAULT = false
  val SHOW_QUOTED_HEADLINE_DEFAULT = false
  val OVERRIDE_ARTICLE_MAIN_MEDIA_DEFAULT = false
}

case class PublishedCollection(id: String, name: String, items: List[PublishedArticle])

case class PublishedFront(id: String, name: String, collections: List[PublishedCollection], swatch: Swatch)

case class PublishedIssue(
  id: String,
  name: String,
  issueDate: LocalDate,
  publicationEventId: Option[String],
  fronts: List[PublishedFront]
)
