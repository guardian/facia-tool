package model.editions

import java.time.LocalDate

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}
import model.editions.PublishAction.PublishAction

import scala.collection.immutable

// TODO traitify PublishedItem - when we have more than one type of collection item

sealed abstract class PublishedMediaType extends EnumEntry with Uncapitalised
object PublishedMediaType extends PlayEnum[PublishedMediaType] {
  case object UseArticleTrail extends PublishedMediaType
  case object Hide extends PublishedMediaType
  case object Cutout extends PublishedMediaType
  case object Image extends PublishedMediaType
  case object CoverCard extends PublishedMediaType

  override def values: immutable.IndexedSeq[PublishedMediaType] = findValues
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

case class PublishedArticle(
    internalPageCode: Long,
    furniture: PublishedFurniture
)

object PublishedArticle {
  val SHOW_BYLINE_DEFAULT = false
  val SHOW_QUOTED_HEADLINE_DEFAULT = false
  val OVERRIDE_ARTICLE_MAIN_MEDIA_DEFAULT = false
}

case class PublishedCollection(
    id: String,
    name: String,
    items: List[PublishedArticle]
)

case class PublishedFront(
    id: String,
    name: String,
    collections: List[PublishedCollection],
    swatch: Swatch
)

case class PublishableIssue(
    action: PublishAction,
    id: String, // TODO: Not sure we should be leaking our internal ID here...
    name: Edition, // TODO: remove this once downstream is consuming 'edition'
    edition: Edition,
    issueDate: LocalDate,
    version: String,
    fronts: List[PublishedFront],
    notificationUTCOffset: Int,
    topic: Option[String]
)
