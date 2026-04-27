package model.editions

import enumeratum.EnumEntry.{Hyphencase, Uncapitalised}
import enumeratum.{EnumEntry, PlayEnum}
import logging.Logging
import model.editions.EditionsArticle.logger
import play.api.libs.json.{Json, OFormat, Reads, Writes}
import scalikejdbc.WrappedResultSet

case class Image(
    height: Option[Int],
    width: Option[Int],
    origin: String,
    src: String,
    thumb: Option[String] = None
) {
  def toPublishedImage: PublishedImage = PublishedImage(height, width, src)
}

object Image {
  implicit val format: OFormat[Image] = Json.format[Image]
}

case class CoverCardImages(mobile: Option[Image], tablet: Option[Image])

object CoverCardImages {
  implicit val format: OFormat[CoverCardImages] = Json.format[CoverCardImages]
}

case class Palette(foregroundHex: String, backgroundHex: String)

object Palette {
  implicit val format: OFormat[Palette] = Json.format[Palette]
}

case class ChefTheme(id: String, palette: Palette)

object ChefTheme {
  implicit val format: OFormat[ChefTheme] = Json.format[ChefTheme]
}

case class FeastCollectionTheme(
    id: String,
    lightPalette: Palette,
    darkPalette: Palette,
    imageURL: Option[String]
)

object FeastCollectionTheme {
  implicit val format: OFormat[FeastCollectionTheme] =
    Json.format[FeastCollectionTheme]
}

sealed trait EditionsCardMetadata

object EditionsCardMetadata {
  implicit val format: OFormat[EditionsCardMetadata] =
    Json.format[EditionsCardMetadata]
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
) extends EditionsCardMetadata

object EditionsArticleMetadata {
  implicit val format: OFormat[EditionsArticleMetadata] =
    Json.format[EditionsArticleMetadata]

  val default = EditionsArticleMetadata(
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None
  )
}

sealed abstract class CardType
    extends EnumEntry
    with Uncapitalised
    with Hyphencase

object CardType extends PlayEnum[CardType] {
  case object Article extends CardType
  case object Recipe extends CardType
  case object Chef extends CardType
  case object FeastCollection extends CardType
  override def values = findValues
}

/** A Card for Editions-based platforms. Analogous to the `Trail` type in
  * facia-scala-client.
  *
  * Distinct from `Trail` because Editions Cards include Feast-specific entities
  * that are not available in facia-scala-client.
  */
sealed trait EditionsCard {
  val id: String
  val addedOn: Long
  val cardType: CardType

  def toSkeleton: EditionsCardSkeleton = this match {
    case EditionsArticle(id, _, metadata) =>
      EditionsCardSkeleton(id, cardType, metadata)
    case EditionsRecipe(id, _)         => EditionsCardSkeleton(id, cardType)
    case EditionsChef(id, _, metadata) =>
      EditionsCardSkeleton(id, cardType, metadata)
    case EditionsFeastCollection(id, _, metadata) =>
      EditionsCardSkeleton(id, cardType, metadata)
  }
}

object EditionsCard {
  implicit val format: OFormat[EditionsCard] = Json.format[EditionsCard]

  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String = ""
  ): Option[EditionsCard] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      cardType <- rs
        .stringOpt(prefix + "card_type")
        .flatMap(CardType.withNameOption)
      addedOn <- rs
        .zonedDateTimeOpt(prefix + "added_on")
        .map(_.toInstant.toEpochMilli)
    } yield cardType match {
      case CardType.Article =>
        EditionsArticle(
          id,
          addedOn,
          metadata = extractMetadata[EditionsArticleMetadata](
            rs,
            prefix,
            EditionsArticleMetadata.default
          )
        )
      case CardType.Chef =>
        EditionsChef(
          id,
          addedOn,
          metadata = extractMetadata[EditionsChefMetadata](
            rs,
            prefix,
            EditionsChefMetadata()
          )
        )
      case CardType.Recipe          => EditionsRecipe(id, addedOn)
      case CardType.FeastCollection =>
        EditionsFeastCollection(
          id,
          addedOn,
          metadata = extractMetadata[EditionsFeastCollectionMetadata](
            rs,
            prefix,
            EditionsFeastCollectionMetadata()
          )
        )
    }
  }

  def getMetadataJson(card: EditionsCard): Option[String] =
    card match {
      case EditionsArticle(_, _, metadata)         => maybeJson(metadata)
      case EditionsChef(_, _, metadata)            => maybeJson(metadata)
      case EditionsFeastCollection(_, _, metadata) => maybeJson(metadata)
      case _                                       => Some("{}")
    }

  private def maybeJson[T](maybeModel: Option[T])(implicit writes: Writes[T]) =
    maybeModel.map(m => Json.toJson(m).toString)

  private def extractMetadata[T](
      rs: WrappedResultSet,
      prefix: String,
      default: T
  )(implicit reads: Reads[T]): Option[T] = rs
    .stringOpt(prefix + "metadata")
    .map(s =>
      Json.parse(s).validate[T] match {
        case result if result.isError =>
          logger.error(s"Unable to parse card from database: \n$s")
          default
        case result => result.get
      }
    )
}

case class EditionsArticle(
    id: String,
    addedOn: Long,
    metadata: Option[EditionsArticleMetadata]
) extends EditionsCard
    with Logging {
  val cardType: CardType = CardType.Article
}

object EditionsArticle extends Logging {
  implicit val format: OFormat[EditionsArticle] = Json.format[EditionsArticle]

  def toPublishedArticle(editionsArticle: EditionsArticle): PublishedArticle = {
    var mediaType: Option[MediaType] =
      editionsArticle.metadata.flatMap(_.mediaType)

    val coverCardImages = editionsArticle.metadata.flatMap { meta =>
      meta.mediaType match {
        case Some(MediaType.CoverCard) =>
          val mobile = meta.coverCardImages.flatMap(_.mobile)
          val tablet = meta.coverCardImages.flatMap(_.tablet)

          (mobile, tablet) match {
            case (Some(m), Some(t)) =>
              Some(PublishedCardImage(m.toPublishedImage, t.toPublishedImage))
            case _ =>
              logger.warn(
                s"Failed to convert card images, must define both mobile and tablet images, falling back to use article trail"
              )
              mediaType = mediaType.map(_ => MediaType.UseArticleTrail)
              None
          }
        case _ => None
      }
    }

    val imageSrcOverride: Option[PublishedImage] =
      editionsArticle.metadata.flatMap(meta => {
        mediaType match {
          case Some(MediaType.Image) =>
            meta.replaceImage.map(_.toPublishedImage)
          case Some(MediaType.Cutout) =>
            meta.cutoutImage.map(_.toPublishedImage)
          case _ => None
        }
      })

    PublishedArticle(
      editionsArticle.id.toLong,
      PublishedFurniture(
        kicker = editionsArticle.metadata.flatMap(_.customKicker),
        headlineOverride = editionsArticle.metadata.flatMap(_.headline),
        trailTextOverride = editionsArticle.metadata.flatMap(_.trailText),
        bylineOverride = editionsArticle.metadata.flatMap(_.byline),
        showByline = editionsArticle.metadata
          .flatMap(_.showByline)
          .getOrElse(PublishedArticle.SHOW_BYLINE_DEFAULT),
        showQuotedHeadline = editionsArticle.metadata
          .flatMap(_.showQuotedHeadline)
          .getOrElse(PublishedArticle.SHOW_QUOTED_HEADLINE_DEFAULT),
        mediaType = mediaType
          .map(_.toPublishedMediaType)
          .getOrElse(PublishedMediaType.UseArticleTrail),
        imageSrcOverride = imageSrcOverride,
        sportScore = editionsArticle.metadata.flatMap(_.sportScore),
        overrideArticleMainMedia = editionsArticle.metadata
          .flatMap(_.overrideArticleMainMedia)
          .getOrElse(PublishedArticle.OVERRIDE_ARTICLE_MAIN_MEDIA_DEFAULT),
        coverCardImages = coverCardImages
      )
    )
  }
}

// Only certain cards are permitted within a FeastCollection.
sealed trait EditionsFeastCollectionItem extends EditionsCard

object EditionsFeastCollectionItem {
  implicit val format: OFormat[EditionsFeastCollectionItem] =
    Json.format[EditionsFeastCollectionItem]
}

case class EditionsRecipe(id: String, addedOn: Long)
    extends EditionsCard
    with EditionsFeastCollectionItem {
  val cardType: CardType = CardType.Recipe
}

object EditionsRecipe {
  implicit val format: OFormat[EditionsRecipe] = Json.format[EditionsRecipe]
}

case class EditionsChefMetadata(
    bio: Option[String] = None,
    theme: Option[ChefTheme] = None,
    chefImageOverride: Option[Image] = None
) extends EditionsCardMetadata

object EditionsChefMetadata {
  implicit val format: OFormat[EditionsChefMetadata] =
    Json.format[EditionsChefMetadata]
}

case class EditionsChef(
    id: String,
    addedOn: Long,
    metadata: Option[EditionsChefMetadata]
) extends EditionsCard
    with EditionsFeastCollectionItem {
  val cardType: CardType = CardType.Chef
}

object EditionsChef {
  implicit val format: OFormat[EditionsChef] = Json.format[EditionsChef]
}

case class EditionsFeastCollectionMetadata(
    title: Option[String] = None,
    theme: Option[FeastCollectionTheme] = None,
    collectionItems: List[EditionsFeastCollectionItem] = List.empty
) extends EditionsCardMetadata

object EditionsFeastCollectionMetadata {
  implicit val format: OFormat[EditionsFeastCollectionMetadata] =
    Json.format[EditionsFeastCollectionMetadata]
}

case class EditionsFeastCollection(
    id: String,
    addedOn: Long,
    metadata: Option[EditionsFeastCollectionMetadata]
) extends EditionsCard {
  val cardType: CardType = CardType.FeastCollection
}

object EditionsFeastCollection {
  implicit val format: OFormat[EditionsFeastCollection] =
    Json.format[EditionsFeastCollection]
}
