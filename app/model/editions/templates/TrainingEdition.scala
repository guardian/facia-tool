package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TrainingEdition {
  lazy val template = EditionTemplate(
    List(
      FrontNewsSpecial -> Daily(),
      FrontWorldSpecial -> Daily(),
      FrontOpinionSpecial -> Daily(),
      FrontCrosswords -> Daily(),
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = 0)
    )
  )

  def FrontNewsSpecial = specialFront("News Special", News)

  def FrontWorldSpecial = specialFront("World Special", News)

  def FrontOpinionSpecial = specialFront("Journal Special", Opinion)

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword"),
  )
}
