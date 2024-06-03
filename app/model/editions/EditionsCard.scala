package model.editions

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}
import logging.Logging
import play.api.libs.json.{JsResult, Json, OFormat}
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
  implicit val format: OFormat[Image] = Json.format[Image]
}

case class CoverCardImages(mobile: Option[Image], tablet: Option[Image])

object CoverCardImages {
  implicit val format: OFormat[CoverCardImages] = Json.format[CoverCardImages]
}

case class CardMetadata(
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

object CardMetadata {
  implicit val format: OFormat[CardMetadata] = Json.format[CardMetadata]

  val default = CardMetadata(None, None, None, None, None, None, None, None, None, None, None, None, None)
}

sealed abstract class CardType extends EnumEntry with Uncapitalised

object CardType extends PlayEnum[CardType] {
  case object Article extends CardType
  case object Recipe extends CardType
  case object Chef extends CardType
  override def values = findValues
}

/**
  * A Card for Editions-based platforms. Analogous to the `Trail` type in
  * facia-scala-client.
  *
  * I suspect it's distinct from `Trail` because the Editions cards have
  * slightly different properties:
  *   - `frontPublicationDate` does not make sense in this context and is
  *     replaced with `addedOn`
  *   - `publishedBy` is not required ... and `Trail` is in a library upstream
  *     that is not used by the Editions product.
  *
  * Ideally, this and Trail would be perhaps be represented by a sealed trait
  * and a discriminator field (arguably cardType) – the client does not
  * distinguish between these two types.
  */
case class EditionsCard(id: String, cardType: CardType, addedOn: Long, metadata: Option[CardMetadata]) extends Logging {

  def toPublishedCard: PublishedArticle = {
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

object EditionsCard extends Logging {
  implicit val writes: OFormat[EditionsCard] = Json.format[EditionsCard]

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsCard] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      cardType <- rs.stringOpt(prefix + "card_type").flatMap(CardType.withNameOption)
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
    } yield
      EditionsCard(
        id,
        cardType,
        addedOn,
        rs.stringOpt(prefix + "metadata").map(
          s => Json.parse(s).validate[CardMetadata] match {
            case result if (result.isError) => {
              logger.error(s"Unable to parse card from database: \n${s}")
              CardMetadata.default
            }
            case result@_ => result.get
          }
        )
      )
  }
}
