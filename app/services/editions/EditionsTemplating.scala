package services.editions

import java.time.{LocalDate, LocalTime, ZonedDateTime}

import model.editions.templates.DailyEdition
import model.editions._
import services.Capi

import scala.concurrent.Await
import scala.concurrent.duration._

class EditionsTemplating(capi: Capi) {
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
                        Await.result(capi.getPrefillArticles(date, prefill), 10 seconds).toList
                      }.getOrElse(Nil),
                      collection.prefill,
                      collection.presentation,
                      collection.hidden
                    )
                  },
                  frontTemplate.presentation,
                  frontTemplate.hidden
                )
            }))
        } else {
          None
        }
      }
  }
}
