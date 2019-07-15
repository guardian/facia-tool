package model.editions

import com.gu.editions.{PublishedArticle, PublishedFurniture}
import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class Image (
  height: String,
  width: String,
  origin: String,
  src: String,
  thumb: Option[String] = None
)

object Image{
  implicit val format = Json.format[Image]
}

case class ArticleMetadata (
  headline: Option[String],
  customKicker: Option[String],
  trailText: Option[String],
  showQuotedHeadline: Option[Boolean],
  showByline: Option[Boolean],
  byline: Option[String],

  imageOption: Option[ImageOption],

  // keep overrides even if not used so user can switch back w/out needing to re-crop
  cutoutImage: Option[Image],
  replaceImage: Option[Image],
  slideshowImages: Option[List[Image]]
)

object ArticleMetadata {
  implicit val format = Json.format[ArticleMetadata]
}

case class EditionsArticle(pageCode: String, addedOn: Long, metadata: Option[ArticleMetadata]) {
  def toPublishedArticle: PublishedArticle = PublishedArticle(
    pageCode.toLong,
    PublishedFurniture(
      kicker = metadata.flatMap(_.customKicker),
      headlineOverride = metadata.flatMap(_.headline),
      trailTextOverride = metadata.flatMap(_.trailText),
      bylineOverride = metadata.flatMap(_.byline),
      showByline = metadata.flatMap(_.showByline).getOrElse(false),
      showQuotedHeadline = metadata.flatMap(_.showQuotedHeadline).getOrElse(false),
      imageSrcOverride = None // TODO (sihil): Store in DB and populate here
    )
  )
}

object EditionsArticle {
  implicit val writes = Json.format[EditionsArticle]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsArticle = {
    EditionsArticle(
      rs.string(prefix + "page_code"),
      rs.zonedDateTime(prefix + "added_on").toInstant.toEpochMilli,
      rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[ArticleMetadata].get)
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsArticle] = {
    for {
      pageCode <- rs.stringOpt(prefix + "page_code")
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
    } yield
      EditionsArticle(
        pageCode,
        addedOn,
        rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[ArticleMetadata].get)
      )
  }
}
