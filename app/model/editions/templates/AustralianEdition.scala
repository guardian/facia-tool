package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object AustralianEdition {
  lazy val template = EditionTemplate(
    List(
      // Top Stories and Nuclear specials
      // News fronts then special
      FrontNewsAuGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsAuGuardianSaturday -> WeekDays(List(WeekDay.Sat)),
      FrontNewsAuObserver -> WeekDays(List(WeekDay.Sun)),
    ),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = 0
      )
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = s"fronts-editions-au",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0
      ))
    )
  )

  def FrontNewsAuGuardian = front(
    "National",
    Some("au"),
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("Australian News").printSentAnyTag("theguardian/mainsection/au", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")

  )
  .swatch(News)

  def FrontNewsAuGuardianSaturday = front(
    "National",
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("Au News").printSentAnyTag("theguardian/mainsection/au", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("Week in Review").printSentAnyTag("theguardian/mainsection/week-in-review"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")
  )
  .swatch(News)

  def FrontNewsAuObserver = front(
    "National",
    collection("Front Page"),
    collection("Au News").printSentAnyTag("theobserver/news/au"),
    collection("Focus").printSentAnyTag("theobserver/news/focus").special,
    collection("News Special").special,
  )
  .swatch(News)
}
