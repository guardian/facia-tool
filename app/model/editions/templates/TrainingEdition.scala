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
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = CapiTimeWindowConfigInDays(
        startOffset = 0,
        endOffset = 0,
        useDate = UseDateQueryParamValue.NewspaperEdition
      )
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = s"fronts-editions-${this.getClass.toString}",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = -3
      ))
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
