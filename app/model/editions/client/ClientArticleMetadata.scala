package model.editions.client

import ai.x.play.json.Jsonx
import model.editions.{ArticleMetadata, CoverCardImages, Image, MediaType}

// This is a subset of the shared model here - https://github.com/guardian/facia-scala-client/blob/master/facia-json/src/main/scala/com/gu/facia/client/models/Collection.scala#L18
// Why not reuse that model? We only want to surface the fields necessary for editions
case class ClientArticleMetadata (
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
  coverCardTabletImage: Option[Image]
) {
  def toArticleMetadata: ArticleMetadata = {
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

    ArticleMetadata(
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
      None
    )
  }
}

object ClientArticleMetadata {
  implicit val format = Jsonx.formatCaseClassUseDefaults[ClientArticleMetadata]

  def fromArticleMetadata(articleMetadata: ArticleMetadata): ClientArticleMetadata = {
    val mediaType: MediaType = articleMetadata.mediaType.getOrElse(MediaType.UseArticleTrail)

    ClientArticleMetadata(
      articleMetadata.headline,
      articleMetadata.customKicker,
      articleMetadata.customKicker.map(_ => true),
      articleMetadata.trailText,
      articleMetadata.showQuotedHeadline,
      articleMetadata.showByline,
      articleMetadata.byline,
      articleMetadata.sportScore,

      articleMetadata.mediaType.collect({case MediaType.Hide => true}),

      articleMetadata.replaceImage.map(_ => mediaType == MediaType.Image),
      articleMetadata.replaceImage.map(_.src),
      articleMetadata.replaceImage.flatMap(_.height).map(_.toString),
      articleMetadata.replaceImage.flatMap(_.width).map(_.toString),
      articleMetadata.replaceImage.map(_.origin),
      articleMetadata.replaceImage.flatMap(_.thumb),

      articleMetadata.mediaType.map(_ == MediaType.Cutout),
      articleMetadata.cutoutImage.map(_.src),
      articleMetadata.cutoutImage.flatMap(_.height).map(_.toString),
      articleMetadata.cutoutImage.flatMap(_.width).map(_.toString),
      articleMetadata.cutoutImage.map(_.origin),

      articleMetadata.overrideArticleMainMedia,

      articleMetadata.mediaType.map {_ => mediaType == MediaType.CoverCard},
      articleMetadata.coverCardImages.flatMap(_.mobile),
      articleMetadata.coverCardImages.flatMap(_.tablet),
    )
  }
}
