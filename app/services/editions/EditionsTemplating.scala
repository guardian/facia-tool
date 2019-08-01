package services.editions

import java.time.{LocalDate, LocalTime, ZonedDateTime}

import logging.Logging
import model.editions._
import services.Capi

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try

import scala.language.postfixOps

class EditionsTemplating(capi: Capi) extends Logging {
  def generateEditionTemplate(name: String, localDate: LocalDate): Option[EditionsIssueSkeleton] = {
   EditionsTemplates.templates
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
    val items = Try(Await.result(capi.getPrefillArticleItems(date, prefillQuery), 10 seconds)).getOrElse(Nil)
    items.map { case (pageCode, capiMetadata) =>
      val metadata = ArticleMetadata.default.copy(
        showByline = Some(capiMetadata.showByline),
        showQuotedHeadline = Some(capiMetadata.showQuotedHeadline),
        mediaType = if (capiMetadata.cutout.isDefined) Some(MediaType.Cutout) else None,
        cutoutImage = capiMetadata.cutout.map(url => Image(None, None, url, url))
      )
      EditionsArticleSkeleton(pageCode, metadata)
    }
  }
}
