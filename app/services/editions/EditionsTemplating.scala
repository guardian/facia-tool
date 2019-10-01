package services.editions

import java.time.{LocalDate, LocalTime, ZonedDateTime}

import logging.Logging
import model.editions._
import services.{Capi, Prefill}

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.control.NonFatal

class EditionsTemplating(templates: Map[String, EditionTemplate], capi: Capi) extends Logging {
  def generateEditionTemplate(name: String, localDate: LocalDate): Option[EditionsIssueSkeleton] = {
   templates
      .get(name)
      .flatMap { template =>
        if (template.availability.isValid(localDate)) {
          Some(EditionsIssueSkeleton(
            localDate,
            template.zoneId,
            template.fronts
              .filter(_._2.isValid(localDate))
              .map { case (frontTemplate, _) =>
                EditionsFrontSkeleton(
                  frontTemplate.name,
                  frontTemplate.collections.map { collection =>
                    EditionsCollectionSkeleton(
                      collection.name,
                      collection.prefill.map { prefill =>
                        getPrefillArticles(localDate, prefill)
                      }.getOrElse(Nil),
                      collection.prefill,
                      collection.presentation,
                      collection.hidden
                    )
                  },
                  frontTemplate.presentation,
                  frontTemplate.hidden,
                  frontTemplate.isSpecial
                )
            }))
        } else {
          None
        }
      }
  }

  // this function fetches articles from CAPI with enough data to resolve the defaults
  def getPrefillArticles(date: LocalDate, prefillQuery: CapiPrefillQuery): List[EditionsArticleSkeleton] = {
    // TODO: This being a try will hide a litany of failures, some of which we might want to surface
    val items = try {
      Await.result(capi.getPrefillArticleItems(date, prefillQuery), 10 seconds)
    } catch {
      case NonFatal(t) =>
        // At least log this as a warning so we can trace frequency
        logger.warn(s"Failed to successfully execute CAPI prefill query $prefillQuery", t)
        Nil
    }
    items.map { case Prefill(pageCode, metaData, cutoutImage, tone, mediaType, customKicker) =>
      val articleMetadata = ArticleMetadata.default.copy(
        showByline = if (metaData.showByline) Some(true) else None,
        showQuotedHeadline = if (metaData.showQuotedHeadline) Some(true) else None,
        mediaType = mediaType,
        cutoutImage = cutoutImage
      )
      EditionsArticleSkeleton(pageCode.toString, articleMetadata)
    }
  }
}
