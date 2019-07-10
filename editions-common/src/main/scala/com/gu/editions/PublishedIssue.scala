package com.gu.editions

import java.time.OffsetDateTime

// TODO traitify PublishedItem - when we have more than one type of collection item

case class MediaUrl(url: String) extends AnyVal

case class PublishedArticleMetadata(kicker: Option[String], headline: Option[String], imageSrc: Option[MediaUrl])

case class PublishedArticle(internalPageCode: Long, meta: PublishedArticleMetadata)

case class PublishedCollection(id: String, items: List[PublishedArticle])

case class PublishedFront(id: String, name: String, collections: List[PublishedCollection])

case class PublishedIssue(id: String, name: String, issueDate: OffsetDateTime, fronts: List[PublishedFront])

