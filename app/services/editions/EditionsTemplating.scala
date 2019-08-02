package services.editions

import java.time.{LocalDate, LocalTime, ZonedDateTime}

import logging.Logging
import model.editions._
import services.Capi

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try

import scala.language.postfixOps

class EditionsTemplating(templates: Map[String, EditionTemplate], capi: Capi) extends Logging {
  def generateEditionTemplate(name: String, localDate: LocalDate): Option[EditionsIssueSkeleton] = {
   templates
      .get(name)
      .flatMap { template =>
        // Convert the human understood date of an issue to a timestamp in the correct zone for this issue
        val date = ZonedDateTime.of(localDate, LocalTime.MIDNIGHT, template.zoneId)

        if (template.availability.isValid(date)) {
          Some(EditionsIssueSkeleton(
            date,
            template.zoneId,
            template.fronts
              .filter(_._2.isValid(date))
              .map { case (frontTemplate, _) =>
                EditionsFrontSkeleton(
                  frontTemplate.name,
                  frontTemplate.collections.map { collection =>
                    EditionsCollectionSkeleton(
                      collection.name,
                      collection.prefill.map { prefill =>
                        getPrefillArticles(date, prefill)
                      }.getOrElse(Nil),
                      collection.prefill,
                      collection.presentation,
                      collection.hidden
                    )
                  },
                  frontTemplate.presentation,
                  frontTemplate.hidden,
                  frontTemplate.canRename
                )
            }))
        } else {
          None
        }
      }
  }

  // this function fetches articles from CAPI with enough data to resolve the defaults
  def getPrefillArticles(date: ZonedDateTime, prefillQuery: CapiPrefillQuery): List[EditionsArticleSkeleton] = {
    // TODO: This being a Try will hide a litany of failures, some of which we might want to surface
    val items = Try(Await.result(capi.getPrefillArticleItems(date, prefillQuery), 10 seconds)).getOrElse(Nil)
    items.map { case (pageCode, capiMetadata) =>
      val (mediaType, cutoutImage) = (capiMetadata.imageCutoutReplace, capiMetadata.cutout) match {
        // if cutout desired and a cutout was found then configure cutout
        case (true, Some(url)) => (Some(MediaType.Cutout), Some(Image(None, None, url, url)))
        // if no cutout desired then default nothing
        case (false, _) => (None, None)
        // finally if a cutout is desired but nothing appropriate was found then explicitly set to use article trail
        case (true, None) => (Some(MediaType.UseArticleTrail), None)
      }
      val metadata = ArticleMetadata.default.copy(
        showByline = if (capiMetadata.showByline) Some(true) else None,
        showQuotedHeadline = if (capiMetadata.showQuotedHeadline) Some(true) else None,
        mediaType = mediaType,
        cutoutImage = cutoutImage
      )
      EditionsArticleSkeleton(pageCode, metadata)
    }
  }
}
