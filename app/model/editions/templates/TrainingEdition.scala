package model.editions.templates

import java.time.ZoneId

import model.editions.PathType.Search
import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TrainingEdition {
  lazy val template = EditionTemplate(
    List(
      FrontNewsYesterday -> Daily(),
      FrontNewsLastWeek -> Daily(),
      FrontNewsLastMonth -> Daily(),
      FrontWorldSpecial -> Daily(),
      FrontOpinionSpecial -> Daily(),
      FrontCrosswords -> Daily(),
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0,
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = s"fronts-editions-${this.getClass.toString}",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = -3
      ))
    )
  )

  def FrontNewsYesterday = front("News (Yesterday)", None,
    CollectionTemplate("Yesterday's Education news",
      None,
      Some(CapiPrefillQuery("?tag=theguardian/mainsection/education", Search)),
      Defaults.defaultCollectionPresentation,
      Some(CapiTimeWindowConfigInDays(-1, 0)),
      false)).swatch(News)

  def FrontNewsLastWeek = front("News (Last Week)", None,
    CollectionTemplate("Last Week's Education news",
      None,
      Some(CapiPrefillQuery("?tag=theguardian/mainsection/education", Search)),
      Defaults.defaultCollectionPresentation,
      Some(CapiTimeWindowConfigInDays(-7, 0)),
      false)).swatch(News)

  def FrontNewsLastMonth = front("News (Last Month)", None,
    CollectionTemplate("Last Month's Education news",
      None,
      Some(CapiPrefillQuery("?tag=theguardian/mainsection/education", Search)),
      Defaults.defaultCollectionPresentation,
      Some(CapiTimeWindowConfigInDays(-31, 0)),
      false)).swatch(News)

  def FrontWorldSpecial = specialFront("World Special", News)

  def FrontOpinionSpecial = specialFront("Journal Special", Opinion)

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword"),
  )
}
