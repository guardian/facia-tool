package model.editions

import enumeratum.EnumEntry.{Uncapitalised, Hyphencase}
import enumeratum.{EnumEntry, PlayEnum}
import logging.Logging
import play.api.libs.json.{JsResult, Json, OFormat}
import scalikejdbc.WrappedResultSet
import play.api.libs.json.JsValue
import play.api.libs.json.JsPath
import play.api.libs.json.JsonValidationError
import play.api.libs.json.JsError
import play.api.libs.json.Reads

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
  implicit val format: OFormat[Image] = Json.format[Image]
}

case class CoverCardImages(mobile: Option[Image], tablet: Option[Image])

object CoverCardImages {
  implicit val format: OFormat[CoverCardImages] = Json.format[CoverCardImages]
}


case class Palette(paletteId: String, foregroundHex: String, backgroundHex: String)

object Palette {
    implicit val format: OFormat[Palette] = Json.format[Palette]
}

case class EditionsArticleMetadata(
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
  coverCardImages: Option[CoverCardImages],
  promotionMetric: Option[Double]
)

object EditionsArticleMetadata {
  implicit val format: OFormat[EditionsArticleMetadata] = Json.format[EditionsArticleMetadata]

  val default = EditionsArticleMetadata(None, None, None, None, None, None, None, None, None, None, None, None, None)
}

sealed abstract class CardType extends EnumEntry with Uncapitalised with Hyphencase

object CardType extends PlayEnum[CardType] {
  case object Article extends CardType
  case object Recipe extends CardType
  case object Chef extends CardType
  case object FeastCollection extends CardType
  override def values = findValues
}

/**
  * A Card for Editions-based platforms. Analogous to the `Trail` type in
  * facia-scala-client.
  *
  * Distinct from `Trail` because Editions Cards include Feast-specific entities that are 
  * not available in facia-scala-client.
  */
sealed trait EditionsCard

object EditionsCard {
  implicit val format: OFormat[EditionsCard] = Json.format[EditionsCard]
}

case class EditionsArticle(id: String, addedOn: Long, metadata: Option[EditionsArticleMetadata]) extends EditionsCard with Logging {
  def toPublished: PublishedArticle = {
    var mediaType: Option[MediaType] = metadata.flatMap(_.mediaType)

    val coverCardImages = metadata.flatMap { meta =>
      meta.mediaType match {
        case Some(MediaType.CoverCard) =>
          val mobile = meta.coverCardImages.flatMap(_.mobile)
          val tablet = meta.coverCardImages.flatMap(_.tablet)

          (mobile, tablet) match {
            case (Some(m), Some(t)) => Some(PublishedCardImage(m.toPublishedImage, t.toPublishedImage))
            case _ =>
              logger.warn(s"Failed to convert card images, must define both mobile and tablet images, falling back to use article trail")
              mediaType = mediaType.map(_ => MediaType.UseArticleTrail)
              None
          }
        case _ => None
      }
    }

    val imageSrcOverride: Option[PublishedImage] = metadata.flatMap(meta => {
      mediaType match {
        case Some(MediaType.Image) => meta.replaceImage.map(_.toPublishedImage)
        case Some(MediaType.Cutout) => meta.cutoutImage.map(_.toPublishedImage)
        case _ => None
      }
    })

    PublishedArticle(
      id.toLong,
      PublishedFurniture(
        kicker = metadata.flatMap(_.customKicker),
        headlineOverride = metadata.flatMap(_.headline),
        trailTextOverride = metadata.flatMap(_.trailText),
        bylineOverride = metadata.flatMap(_.byline),
        showByline = metadata.flatMap(_.showByline).getOrElse(PublishedArticle.SHOW_BYLINE_DEFAULT),
        showQuotedHeadline = metadata.flatMap(_.showQuotedHeadline).getOrElse(PublishedArticle.SHOW_QUOTED_HEADLINE_DEFAULT),
        mediaType = mediaType.map(_.toPublishedMediaType).getOrElse(PublishedMediaType.UseArticleTrail),
        imageSrcOverride = imageSrcOverride,
        sportScore = metadata.flatMap(_.sportScore),
        overrideArticleMainMedia = metadata.flatMap(_.overrideArticleMainMedia).getOrElse(PublishedArticle.OVERRIDE_ARTICLE_MAIN_MEDIA_DEFAULT),
        coverCardImages = coverCardImages
      )
    )
  }
}

object EditionsArticle extends Logging {
  implicit val format: OFormat[EditionsArticle] = Json.format[EditionsArticle]

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsCard] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      cardType <- rs.stringOpt(prefix + "card_type").flatMap(CardType.withNameOption)
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
    } yield
      EditionsArticle(
        id,
        addedOn,
        rs.stringOpt(prefix + "metadata").map(
          s => Json.parse(s).validate[EditionsArticleMetadata] match {
            case result if (result.isError) => {
              logger.error(s"Unable to parse card from database: \n${s}")
              EditionsArticleMetadata.default
            }
            case result@_ => result.get
          }
        )
      )
  }
}

case class EditionsRecipe(id: String, addedOn: Long) extends EditionsCard

object EditionsRecipe {
  implicit val format: OFormat[EditionsRecipe] = Json.format[EditionsRecipe]
}

case class EditionsChefMetadata(
  bio: Option[String] = None,
  palette: Option[Palette] = None, 
  chefImageOverride: Option[Image] = None, 
)

object EditionsChefMetadata {
  implicit val format: OFormat[EditionsChefMetadata] = Json.format[EditionsChefMetadata]
}

case class EditionsChef(id: String, addedOn: Long, metadata: Option[EditionsChefMetadata]) extends EditionsCard

object EditionsChef {
  implicit val format: OFormat[EditionsChef] = Json.format[EditionsChef]
}

case class EditionsFeastCollection(id: String, addedOn: Long) extends EditionsCard

object EditionsFeastCollection {
  implicit val format: OFormat[EditionsFeastCollection] = Json.format[EditionsFeastCollection]
}