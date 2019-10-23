package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object AustralianEdition {
  lazy val template = EditionTemplate(
    List(
      FrontTopStoriesAu -> WeekDays(List(WeekDay.Sat)),
      FrontNewsAu -> WeekDays(List(WeekDay.Sat)),
      FrontJournalAu -> WeekDays(List(WeekDay.Sat)),
      FrontNewsFeaturesAu -> WeekDays(List(WeekDay.Sat)),
    ),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = 0
      )
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Weekly(),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = s"fronts-editions-au",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0
      ))
    )
  )

  
  // Manually curated top stories section
  
  def FrontTopStoriesAu = front(
    "Top stories",
    collection("Top Stories")
    )
  .swatch(News)
  
  // News container driven from the tone tag, this is going to be too long as is
  // Need to limit prefill duration by container as well as front?
  
  def FrontNewsAu = front(
    "News",
    Some("au"),
    collection("News").searchPrefill("?tag=tone/news")
  )
  .swatch(News)
  
  //Opinion
  
  def FrontJournalAu = front(
    "Opinion",
    Some("au"),
    collection("Journal").searchPrefill("?tag=tone/comment")
  )
  .swatch(News)
  
  //News Features and Long reads
  
  def FrontNewsFeaturesAu = front(
    "News Features",
    Some("au"),
    collection("Long Read").searchPrefill("?tag=news/series/the-long-read"),
    collection("News Features").searchPrefill("?tag=(tone/news,tone/features)")
  )
  .swatch(News)
}
