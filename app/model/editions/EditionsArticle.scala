package model.editions

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class Image (
  height: Option[Int],
  width: Option[Int],
  origin: String,
  src: String,
  thumb: Option[String] = None
) {
  def toPublishedImage: PublishedImage = PublishedImage(height,width,src)
}

object Image {
  implicit val format = Json.format[Image]
}

case class CoverCardImages(mobile: Option[Image], tablet: Option[Image]) {
  def toPublishedCardImage: Option[PublishedCardImage] = {
    (mobile, tablet) match {
      case (Some(m), Some(t)) => Some(PublishedCardImage(m.toPublishedImage, t.toPublishedImage))
      case (None, Some(_)) => throw new IllegalStateException("Must define both mobile and tablet images")
      case (Some(_), None) => throw new IllegalStateException("Must define both mobile and tablet images")
      case _ => None
    }
  }
}

object CoverCardImages {
  implicit val format = Json.format[CoverCardImages]
}

case class ArticleMetadata (
  headline: Option[String],
  customKicker: Option[String],
  trailText: Option[String],
  showQuotedHeadline: Option[Boolean],
  showByline: Option[Boolean],
  byline: Option[String],
  sportScore: Option[String],

  mediaType: Option[MediaType],

  // keep overrides even if not used so user can switch back w/out needing to re-crop
  cutoutImage: Option[Image],

  replaceImage: Option[Image],
  overrideArticleMainMedia: Option[Boolean],
  coverCardImages: Option[CoverCardImages]
)

object ArticleMetadata {
  implicit val format = Json.format[ArticleMetadata]

  val default = ArticleMetadata(None, None, None, None, None, None, None, None, None, None, None, None)
}

case class EditionsArticle(pageCode: String, addedOn: Long, metadata: Option[ArticleMetadata]) {
  def toPublishedArticle: PublishedArticle = {
    val imageSrcOverride: Option[PublishedImage] = metadata.flatMap(meta => {
      meta.mediaType match {
        case Some(MediaType.Image) => meta.replaceImage.map(_.toPublishedImage)
        case Some(MediaType.Cutout) => meta.cutoutImage.map(_.toPublishedImage)
        case _ => None
      }
    })

    val coverCardImages = metadata.flatMap { meta => {
      meta.mediaType match {
        case Some(MediaType.CoverCard) => meta.coverCardImages.flatMap(_.toPublishedCardImage)
        case _ => None
      }
    }}

    PublishedArticle(
      pageCode.toLong,
      PublishedFurniture(
        kicker = metadata.flatMap(_.customKicker),
        headlineOverride = metadata.flatMap(_.headline),
        trailTextOverride = metadata.flatMap(_.trailText),
        bylineOverride = metadata.flatMap(_.byline),
        showByline = metadata.flatMap(_.showByline).getOrElse(false),
        showQuotedHeadline = metadata.flatMap(_.showQuotedHeadline).getOrElse(false),
        mediaType = metadata.flatMap(_.mediaType).map(_.toPublishedMediaType).getOrElse(PublishedMediaType.UseArticleTrail),
        imageSrcOverride = imageSrcOverride,
        sportScore = metadata.flatMap(_.sportScore),
        overrideArticleMainMedia = metadata.flatMap(_.overrideArticleMainMedia).getOrElse(true),
        coverCardImages = coverCardImages
      )
    )
  }
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
