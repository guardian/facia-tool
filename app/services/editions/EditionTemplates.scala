package services.editions

import java.time.ZonedDateTime

import model.editions._
import model.editions.WeekDay._

object EditionTemplates {
  private val dailyEdition = EditionTemplate(
    List(
      (Fronts.ukNews, Daily()),
      (Fronts.sports, Daily()),
      (Fronts.opinion, WeekDays(List(Thurs, Wed))),
      (Fronts.technology, WeekDays(List(Thurs)))
    ),
    Daily()
  )

  private val templates: Map[String, EditionTemplate] = Map(
    "dailyEdition" -> dailyEdition
  )

  val getAvailableEditions: List[String] = templates.keys.toList

  def generateEditionTemplate(
      name: String,
      date: ZonedDateTime
  ): Option[EditionTemplateForDate] = {
    templates
      .get(name)
      .filter { template =>
        template.availability.isValid(date)
      }
      .map { template =>
        EditionTemplateForDate(
          template.fronts.filter(_._2.isValid(date)).map(_._1)
        )
      }
  }
}

object Sport {
  val emptyCollectionPresentation = CollectionPresentation()
  val football: CollectionTemplate = CollectionTemplate(
    "Football",
    CapiQuery("???"),
    emptyCollectionPresentation
  )
  val cricket: CollectionTemplate =
    CollectionTemplate("Cricket", CapiQuery("???"), emptyCollectionPresentation)
}

object Fronts {
  val emptyFrontPresentation = FrontPresentation()
  val ukNews: FrontTemplate =
    FrontTemplate("UK news", List(), emptyFrontPresentation)
  val sports: FrontTemplate = FrontTemplate(
    "Sport",
    List(
      Sport.football,
      Sport.cricket
    ),
    emptyFrontPresentation
  )
  val technology: FrontTemplate = FrontTemplate(
    "Technology",
    List(),
    emptyFrontPresentation
  )

  val opinion: FrontTemplate =
    FrontTemplate("Opinion", List(), emptyFrontPresentation)
}
