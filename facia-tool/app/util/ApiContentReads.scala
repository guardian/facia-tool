package util

import com.gu.contentapi.client.model._

case class RealTag(
    id: String,
    `type` : String,
    sectionId: Option[String],
    sectionName: Option[String],
    webTitle: String,
    webUrl: String,
    apiUrl: String,
    references: Option[List[Reference]],
    description: Option[String],
    bio: Option[String],
    bylineImageUrl: Option[String],
    bylineLargeImageUrl: Option[String],
    podcast: Option[Podcast]
) {
  def toTag = Tag(
    id,
    `type`,
    sectionId,
    sectionName,
    webTitle,
    webUrl,
    apiUrl,
    references getOrElse Nil,
    description,
    bio,
    bylineImageUrl,
    bylineLargeImageUrl,
    podcast
  )
}
