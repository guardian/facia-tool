package model.editions.client

import model.editions.{ArticleMetadata, Image, ImageOption}
import play.api.libs.json.Json

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

  imageSlideshowReplace: Option[Boolean],
  slideshow: Option[List[Image]]
) {
  def toArticleMetadata: ArticleMetadata = {
    val cutoutImage: Option[Image] = (imageCutoutSrcHeight, imageCutoutSrcWidth, imageCutoutSrc, imageCutoutSrcOrigin) match {
      case (Some(height), Some(width), Some(src), Some(origin)) => Some(Image(height, width, origin, src))
      case _ => None
    }

    val replaceImage: Option[Image] = (imageSrcHeight, imageSrcWidth, imageSrc, imageSrcOrigin, imageSrcThumb) match {
      case (Some(height), Some(width), Some(src), Some(origin), Some(thumb)) => Some(Image(height, width, origin, src, Some(thumb)))
      case _ => None
    }

    val imageOption = (imageHide, imageReplace, imageCutoutReplace, imageSlideshowReplace) match {
      case (Some(true), _, _, _) => ImageOption.Hide
      case (_, Some(true), _, _) => ImageOption.Replace
      case (_, _, Some(true), _) => ImageOption.ReplaceCutout
      case (_, _, _, Some(true)) => ImageOption.ReplaceSlideshow
      case _ => ImageOption.UseArticleTrail
    }

    ArticleMetadata(
      headline,
      customKicker,
      trailText,
      showQuotedHeadline,
      showByline,
      byline,
      Some(imageOption),
      cutoutImage,
      replaceImage,
      slideshow
    )
  }
}

object ClientArticleMetadata {
  implicit val format = Json.format[ClientArticleMetadata]

  def fromArticleMetadata(articleMetadata: ArticleMetadata): ClientArticleMetadata = {
    val imgOpt: ImageOption = articleMetadata.imageOption.getOrElse(ImageOption.UseArticleTrail)

    ClientArticleMetadata(
      articleMetadata.headline,
      articleMetadata.customKicker,
      articleMetadata.customKicker.map(_ => true),
      articleMetadata.trailText,
      articleMetadata.showQuotedHeadline,
      articleMetadata.showByline,
      articleMetadata.byline,

      articleMetadata.imageOption.map(_ == ImageOption.Hide),

      articleMetadata.replaceImage.map(_ => imgOpt == ImageOption.Replace),
      articleMetadata.replaceImage.map(_.src),
      articleMetadata.replaceImage.map(_.height),
      articleMetadata.replaceImage.map(_.width),
      articleMetadata.replaceImage.map(_.origin),
      articleMetadata.replaceImage.flatMap(_.thumb),

      articleMetadata.cutoutImage.map(_ => imgOpt == ImageOption.ReplaceCutout),
      articleMetadata.cutoutImage.map(_.src),
      articleMetadata.cutoutImage.map(_.height),
      articleMetadata.cutoutImage.map(_.width),
      articleMetadata.cutoutImage.map(_.origin),

      articleMetadata.slideshowImages.map(_ => imgOpt == ImageOption.ReplaceSlideshow),
      articleMetadata.slideshowImages
    )
  }
}
