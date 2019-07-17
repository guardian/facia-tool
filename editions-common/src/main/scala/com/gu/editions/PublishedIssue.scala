package com.gu.editions

import java.time.OffsetDateTime

// TODO traitify PublishedItem - when we have more than one type of collection item

case class MediaUrl(url: String) extends AnyVal

case class PublishedFurniture(
  kicker: Option[String],
  headlineOverride: Option[String],
  trailTextOverride: Option[String],
  bylineOverride: Option[String],
  showByline: Boolean,
  showQuotedHeadline: Boolean,
  imageSrcOverride: Option[MediaUrl]
)

case class PublishedArticle(internalPageCode: Long, furniture: PublishedFurniture)

case class PublishedCollection(id: String, items: List[PublishedArticle])

case class PublishedFront(id: String, name: String, collections: List[PublishedCollection])

case class PublishedIssue(id: String, name: String, issueDate: OffsetDateTime, fronts: List[PublishedFront])
