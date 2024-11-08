package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TrainingEdition extends InternalEdition {
  override val title = "The Training Edition"
  override val subTitle = "Internal usage only, for training and demonstrations"
  override val edition = "training-edition"
  override val header = Header("Training Edition")
  override val notificationUTCOffset = 3
  override val topic = "tr"
  override val locale = Some("en_GB")

  lazy val template = EditionTemplate(
    List(
      FrontNewsYesterday -> Daily(),
      FrontNewsLastWeek -> Daily(),
      FrontNewsLastMonth -> Daily(),
      FrontWorldSpecial -> Daily(),
      FrontOpinionSpecial -> Daily(),
      FrontCrosswords -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = Some(
      OphanQueryPrefillParams(
        apiKey = s"fronts-editions-${this.getClass.toString}",
        timeWindowConfig = TimeWindowConfigInDays(
          startOffset = 0,
          endOffset = -3
        )
      )
    )
  )

  private val query = "?tag=theguardian/mainsection/education"

  def FrontNewsYesterday = front(
    "News",
    None,
    collection("Yesterday's Education news")
      .searchPrefill(query)
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-1, 0))),
    collection("News"),
    collection("News"),
    collection("News")
  ).swatch(News)

  def FrontNewsLastWeek = front(
    "Features",
    None,
    collection("Last Week's Education news")
      .searchPrefill(query)
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-7, 0))),
    collection("Features"),
    collection("Features"),
    collection("Features")
  ).swatch(News)

  def FrontNewsLastMonth = front(
    "Sport",
    None,
    collection("Last Month's Education news")
      .searchPrefill(query)
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-31, 0))),
    collection("Sport"),
    collection("Sport"),
    collection("Sport")
  ).swatch(News)

  def FrontWorldSpecial = specialFront("World Special", News)

  def FrontOpinionSpecial = specialFront("Journal Special", Opinion)

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword")
  )
}
