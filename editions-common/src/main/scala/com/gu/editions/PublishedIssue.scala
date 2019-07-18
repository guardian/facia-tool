package com.gu.editions

import java.time.OffsetDateTime

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}

// TODO traitify PublishedItem - when we have more than one type of collection item

sealed abstract class PublishedMediaType extends EnumEntry with Uncapitalised
object PublishedMediaType extends PlayEnum[PublishedMediaType] {
  case object UseArticleTrail extends PublishedMediaType
  case object Hide extends PublishedMediaType
  case object Cutout extends PublishedMediaType
  case object Slideshow extends PublishedMediaType
  case object Image extends PublishedMediaType

  override def values = findValues
}

case class PublishedImage(height: Int, width: Int, src: String)

case class PublishedFurniture(
  kicker: Option[String],
  headlineOverride: Option[String],
  trailTextOverride: Option[String],
  bylineOverride: Option[String],
  showByline: Boolean,
  showQuotedHeadline: Boolean,
  mediaType: PublishedMediaType,
  imageSrcOverride: Option[PublishedImage],
  slideshowImages: Option[List[PublishedImage]]
)

case class PublishedArticle(internalPageCode: Long, furniture: PublishedFurniture)

case class PublishedCollection(id: String, items: List[PublishedArticle])

case class PublishedFront(id: String, name: String, collections: List[PublishedCollection])

case class PublishedIssue(id: String, name: String, issueDate: OffsetDateTime, fronts: List[PublishedFront])
