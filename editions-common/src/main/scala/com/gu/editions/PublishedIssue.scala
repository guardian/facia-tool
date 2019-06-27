package com.gu.editions

import java.time.ZonedDateTime

// TODO traitify PublishedItem - when we have more than one type of collection item

case class PublishedArticleMetadata(stuffgoeshere: Int)

case class PublishedArticle(id: Long, meta: Option[PublishedArticleMetadata])

case class PublishedCollection(id: String, items: List[PublishedArticle])

case class PublishedFront(id: String, isHidden: Boolean, collections: List[PublishedCollection])

case class PublishedIssue(id: String, name: String, issueDate: ZonedDateTime, fronts: List[PublishedFront])

