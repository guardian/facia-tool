package model.editions.client

import ai.x.play.json.Jsonx
import model.editions.{CardMetadata, CoverCardImages, Image, MediaType}
import play.api.libs.json.OFormat

// This is a subset of the shared model here - https://github.com/guardian/facia-scala-client/blob/master/facia-json/src/main/scala/com/gu/facia/client/models/Collection.scala#L18
// Why not reuse that model? We only want to surface the fields necessary for editions
case class ClientCardMetadata(
  headline: Option[String],
  customKicker: Option[String],
  showKickerCustom: Option[Boolean],
  trailText: Option[String],
  showQuotedHeadline: Option[Boolean],
  showByline: Option[Boolean],
  byline: Option[String],
  sportScore: Option[String],

  imageHide: Option[Boolean],

  imageReplace: Option[Boolean],
  imageSrc: Option[String],
  imageSrcHeight: Option[String],
  imageSrcWidth: Option[String],
  imageSrcOrigin: Option[String],
  imageSrcThumb: Option[String],

  imageCutoutReplace: Option[Boolean],
  imageCutoutSrc: Option[String],
  imageCutoutSrcHeight: Option[String],
  imageCutoutSrcWidth: Option[String],
  imageCutoutSrcOrigin: Option[String],

  overrideArticleMainMedia: Option[Boolean],

  coverCardImageReplace: Option[Boolean],
  coverCardMobileImage: Option[Image],
  coverCardTabletImage: Option[Image],
  promotionMetric: Option[Double],
  bio: Option[String], // Chef
  backgroundHex: Option[String], // Chef
  foregroundHex: Option[String], // Chef
  paletteId: Option[String], // Chef
  chefImageOverride: Option[Image] // Chef
) {
  def toCardMetadata: CardMetadata = {
    val cutoutImage: Option[Image] = (imageCutoutSrcHeight, imageCutoutSrcWidth, imageCutoutSrc, imageCutoutSrcOrigin) match {
      case (height, width, Some(src), Some(origin)) => Some(Image(height.map(_.toInt), width.map(_.toInt), origin, src))
      // If we don't have an origin, duplicate the src into the origin
      case (height, width, Some(src), None) => Some(Image(height.map(_.toInt), width.map(_.toInt), src, src))
      case _ => None
    }

    val replaceImage: Option[Image] = (imageSrcHeight, imageSrcWidth, imageSrc, imageSrcOrigin, imageSrcThumb) match {
      case (height, width, Some(src), Some(origin), Some(thumb)) => Some(Image(height.map(_.toInt), width.map(_.toInt), origin, src, Some(thumb)))
      case _ => None
    }

    val imageOption = (imageHide, imageReplace, imageCutoutReplace, coverCardImageReplace) match {
      case (Some(true), _, _, _) => MediaType.Hide
      case (_, Some(true), _, _) => MediaType.Image
      case (_, _, Some(true), _) => MediaType.Cutout
      case (_, _, _, Some(true)) => MediaType.CoverCard
      case _ => MediaType.UseArticleTrail
    }

    val coverCardImages = (coverCardMobileImage, coverCardTabletImage) match {
      case (None, None) => None
      case _ => Some(CoverCardImages(coverCardMobileImage, coverCardTabletImage))
    }

    CardMetadata(
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
      promotionMetric,
      bio,
      backgroundHex,
      foregroundHex,
      paletteId,
      chefImageOverride
    )
  }
}

object ClientCardMetadata {
  implicit val format: OFormat[ClientCardMetadata] = Jsonx.formatCaseClassUseDefaults[ClientCardMetadata]

  def fromCardMetadata(cardMetadata: CardMetadata): ClientCardMetadata = {
    val mediaType: MediaType = cardMetadata.mediaType.getOrElse(MediaType.UseArticleTrail)

    ClientCardMetadata(
      cardMetadata.headline,
      cardMetadata.customKicker,
      cardMetadata.customKicker.map(_ => true),
      cardMetadata.trailText,
      cardMetadata.showQuotedHeadline,
      cardMetadata.showByline,
      cardMetadata.byline,
      cardMetadata.sportScore,

      cardMetadata.mediaType.collect({case MediaType.Hide => true}),

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

      cardMetadata.mediaType.map { _ => mediaType == MediaType.CoverCard},
      cardMetadata.coverCardImages.flatMap(_.mobile),
      cardMetadata.coverCardImages.flatMap(_.tablet),
      cardMetadata.promotionMetric,
      cardMetadata.bio,
      cardMetadata.backgroundHex,
      cardMetadata.foregroundHex,
      cardMetadata.paletteId,
      cardMetadata.chefImageOverride
    )
  }
}
