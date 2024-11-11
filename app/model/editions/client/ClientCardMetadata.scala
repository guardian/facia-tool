package model.editions.client

import ai.x.play.json.Jsonx
import model.editions.{CoverCardImages, Image, MediaType}
import play.api.libs.json.{OFormat, JsSuccess}
import model.editions.EditionsArticleMetadata
import model.editions.EditionsChefMetadata
import model.editions.FeastCollectionTheme
import model.editions.EditionsFeastCollectionMetadata
import model.editions.ChefTheme

// This is a subset of the shared model here - https://github.com/guardian/facia-scala-client/blob/master/facia-json/src/main/scala/com/gu/facia/client/models/Collection.scala#L18
// Why not reuse that model? We only want to surface the fields necessary for editions
case class ClientCardMetadata(
    headline: Option[String] = None,
    customKicker: Option[String] = None,
    showKickerCustom: Option[Boolean] = None,
    trailText: Option[String] = None,
    showQuotedHeadline: Option[Boolean] = None,
    showByline: Option[Boolean] = None,
    byline: Option[String] = None,
    sportScore: Option[String] = None,
    imageHide: Option[Boolean] = None,
    imageReplace: Option[Boolean] = None,
    imageSrc: Option[String] = None,
    imageSrcHeight: Option[String] = None,
    imageSrcWidth: Option[String] = None,
    imageSrcOrigin: Option[String] = None,
    imageSrcThumb: Option[String] = None,
    imageCutoutReplace: Option[Boolean] = None,
    imageCutoutSrc: Option[String] = None,
    imageCutoutSrcHeight: Option[String] = None,
    imageCutoutSrcWidth: Option[String] = None,
    imageCutoutSrcOrigin: Option[String] = None,
    overrideArticleMainMedia: Option[Boolean] = None,
    coverCardImageReplace: Option[Boolean] = None,
    coverCardMobileImage: Option[Image] = None,
    coverCardTabletImage: Option[Image] = None,
    promotionMetric: Option[Double] = None,
    bio: Option[String] = None, // Chef
    chefTheme: Option[ChefTheme] = None, // Chef
    chefImageOverride: Option[Image] = None, // Chef
    title: Option[String] = None, // FeastCollection
    feastCollectionTheme: Option[FeastCollectionTheme] =
      None, // FeastCollection
    supporting: List[EditionsSupportingClientCard] = List.empty
) {
  def toChefMetadata: EditionsChefMetadata =
    EditionsChefMetadata(
      bio,
      chefTheme,
      chefImageOverride
    )

  def toFeastCollectionMetadata =
    EditionsFeastCollectionMetadata(
      title,
      feastCollectionTheme,
      collectionItems =
        supporting.map(EditionsSupportingClientCard.toFeastCollectionItem)
    )

  def toArticleMetadata: EditionsArticleMetadata = {
    val cutoutImage: Option[Image] = (
      imageCutoutSrcHeight,
      imageCutoutSrcWidth,
      imageCutoutSrc,
      imageCutoutSrcOrigin
    ) match {
      case (height, width, Some(src), Some(origin)) =>
        Some(Image(height.map(_.toInt), width.map(_.toInt), origin, src))
      // If we don't have an origin, duplicate the src into the origin
      case (height, width, Some(src), None) =>
        Some(Image(height.map(_.toInt), width.map(_.toInt), src, src))
      case _ => None
    }

    val replaceImage: Option[Image] = (
      imageSrcHeight,
      imageSrcWidth,
      imageSrc,
      imageSrcOrigin,
      imageSrcThumb
    ) match {
      case (height, width, Some(src), Some(origin), Some(thumb)) =>
        Some(
          Image(
            height.map(_.toInt),
            width.map(_.toInt),
            origin,
            src,
            Some(thumb)
          )
        )
      case _ => None
    }

    val imageOption = (
      imageHide,
      imageReplace,
      imageCutoutReplace,
      coverCardImageReplace
    ) match {
      case (Some(true), _, _, _) => MediaType.Hide
      case (_, Some(true), _, _) => MediaType.Image
      case (_, _, Some(true), _) => MediaType.Cutout
      case (_, _, _, Some(true)) => MediaType.CoverCard
      case _                     => MediaType.UseArticleTrail
    }

    val coverCardImages = (coverCardMobileImage, coverCardTabletImage) match {
      case (None, None) => None
      case _ =>
        Some(CoverCardImages(coverCardMobileImage, coverCardTabletImage))
    }

    EditionsArticleMetadata(
      headline,
      customKicker,
      trailText,
      showQuotedHeadline,
      showByline,
      byline,
      sportScore,
      Some(imageOption),
      cutoutImage,
      replaceImage,
      overrideArticleMainMedia,
      coverCardImages,
      promotionMetric
    )
  }
}

object ClientCardMetadata {
  implicit val format: OFormat[ClientCardMetadata] =
    Jsonx.formatCaseClassUseDefaults[ClientCardMetadata]

  def fromCardMetadata(
      cardMetadata: EditionsFeastCollectionMetadata
  ): ClientCardMetadata = {
    ClientCardMetadata(
      title = cardMetadata.title,
      feastCollectionTheme = cardMetadata.theme,
      supporting = cardMetadata.collectionItems.map(card =>
        EditionsSupportingClientCard.fromFeastCollectionItem(card)
      )
    )
  }

  def fromCardMetadata(
      cardMetadata: EditionsChefMetadata
  ): ClientCardMetadata = {
    ClientCardMetadata(
      bio = cardMetadata.bio,
      chefTheme = cardMetadata.theme,
      chefImageOverride = cardMetadata.chefImageOverride
    )
  }

  def fromCardMetadata(
      cardMetadata: EditionsArticleMetadata
  ): ClientCardMetadata = {
    val mediaType: MediaType =
      cardMetadata.mediaType.getOrElse(MediaType.UseArticleTrail)

    ClientCardMetadata(
      cardMetadata.headline,
      cardMetadata.customKicker,
      cardMetadata.customKicker.map(_ => true),
      cardMetadata.trailText,
      cardMetadata.showQuotedHeadline,
      cardMetadata.showByline,
      cardMetadata.byline,
      cardMetadata.sportScore,
      cardMetadata.mediaType.collect({ case MediaType.Hide => true }),
      cardMetadata.replaceImage.map(_ => mediaType == MediaType.Image),
      cardMetadata.replaceImage.map(_.src),
      cardMetadata.replaceImage.flatMap(_.height).map(_.toString),
      cardMetadata.replaceImage.flatMap(_.width).map(_.toString),
      cardMetadata.replaceImage.map(_.origin),
      cardMetadata.replaceImage.flatMap(_.thumb),
      cardMetadata.mediaType.map(_ == MediaType.Cutout),
      cardMetadata.cutoutImage.map(_.src),
      cardMetadata.cutoutImage.flatMap(_.height).map(_.toString),
      cardMetadata.cutoutImage.flatMap(_.width).map(_.toString),
      cardMetadata.cutoutImage.map(_.origin),
      cardMetadata.overrideArticleMainMedia,
      cardMetadata.mediaType.map { _ => mediaType == MediaType.CoverCard },
      cardMetadata.coverCardImages.flatMap(_.mobile),
      cardMetadata.coverCardImages.flatMap(_.tablet),
      cardMetadata.promotionMetric
    )
  }
}
