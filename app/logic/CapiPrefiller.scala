package logic

import com.gu.contentapi.client.model.v1.{Content, TagType}
import com.gu.facia.api.utils.{CardStyle, ResolvedMetaData}
import com.gu.facia.client.models.TrailMetaData
import model.editions.{Image, MediaType}
import services.editions.prefills.Prefill

object CapiPrefiller {

  private val pluralKickers = Set(
    "tone/letters",
    "tone/analysis",
    "tone/obituaries"
  )
  private val singularKickers = Set(
    "tone/reviews",
    "tone/editorials",
    "tone/matchreports",
    "tone/explainers"
  )
  private val bylineKickers = Set(
    "tone/comment"
  )

  def prefill(content: Content): Prefill = {
    val internalPageCode =
      content.fields.flatMap(_.internalPageCode).getOrElse(-1)
    val newspaperPageNumber = content.fields.flatMap(_.newspaperPageNumber)
    val webUrl = content.webUrl
    val capiId = content.id
    val cardStyle = CardStyle(content, TrailMetaData.empty)
    val metadata = ResolvedMetaData.fromContent(content, cardStyle)

    // ResolvedMetaData here has a ton of booleans, but some may have been set naively
    // If the cutout bool is set, we want to find the cutout values and add them in to a sub-object
    val maybeCutout =
      if (metadata.imageCutoutReplace)
        CapiPrefiller.getFirstContributorWithCutoutOption(content)
      else None

    val (mediaType, cutoutImage) =
      (metadata.imageCutoutReplace, maybeCutout) match {
        // if cutout desired and a cutout was found then configure cutout
        case (true, Some(url)) =>
          (Some(MediaType.Cutout), Some(Image(None, None, url, url)))
        // if no cutout desired then default nothing
        case (false, _) => (None, None)
        // finally if a cutout is desired but nothing appropriate was found then explicitly set to use article trail
        case (true, None) => (Some(MediaType.UseArticleTrail), None)
      }
    val newMetadata =
      metadata.copy(imageCutoutReplace = mediaType.contains(MediaType.Cutout))

    val pickedKicker = pickKicker(content)

    Prefill(
      internalPageCode,
      newspaperPageNumber,
      webUrl,
      newMetadata,
      cutoutImage,
      cardStyle.toneString,
      mediaType,
      pickedKicker,
      None,
      capiId
    )
  }

  def getFirstContributorWithCutoutOption(content: Content): Option[String] =
    content.tags
      .filter(_.`type` == TagType.Contributor)
      .flatMap(_.bylineLargeImageUrl)
      .headOption match {
      case found @ Some(_) => found
      case _               => None
    }

  private[logic] def pickKicker(content: Content): Option[String] =
    content.tags.find(tag => tag.`type` == TagType.Series) match {
      // If we have a series tag, use the web title for the series tag
      case Some(tag) => Some(tag.webTitle)
      // Otherwise...
      case _ =>
        content.tags.find(tag => tag.`type` == TagType.Tone) match {
          // If we have a tone tag that we know how to use, use that...
          case Some(tag) if pluralKickers.contains(tag.id) => Some(tag.webTitle)
          case Some(tag) if singularKickers.contains(tag.id) =>
            Some(tag.webTitle.dropRight(1))
          case Some(tag) if bylineKickers.contains(tag.id) =>
            content.fields.flatMap(f => f.byline)
          // Otherwise...
          case _ =>
            content.tags.headOption match {
              // If there are no tags at all, there's not going to be a kicker!
              case None => None
              // If there IS a tag and it hasn't been used in the content title, use that...
              case Some(firstTag)
                  if !content.webTitle.contains(firstTag.webTitle) =>
                Some(firstTag.webTitle)
              // Otherwise...
              case Some(firstTag) =>
                content.tags.tail.headOption match {
                  // If there is a second tag, and it's not in the title, use that.
                  case Some(secondTag)
                      if !content.webTitle.contains(secondTag.webTitle) =>
                    Some(secondTag.webTitle)
                  // Otherwise...
                  // Use the first tag after all!
                  case _ => Some(firstTag.webTitle)
                }
            }
        }
    }
}
