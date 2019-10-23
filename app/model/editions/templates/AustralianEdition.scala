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
      FrontCultureAu -> WeekDays(List(WeekDay.Sat)),
      FrontLifeAu -> WeekDays(List(WeekDay.Sat)),
      FrontSportAu -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsAu -> WeekDays(List(WeekDay.Sat))
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
    collection("News").searchPrefill("?tag=(tone/news,australia-news/australia-news)-tone/comment"),
    collection("World News").searchPrefill("?tag=(tone/news-australia-news/australia-news)-tone/comment")
  )
  .swatch(News)
  
  //Opinion
  
  def FrontJournalAu = front(
    "Journal",
    Some("au"),
    collection("Opinion").searchPrefill("?tag=(australia-news/australia-news,tone/comment)"),
    collection("World Opinion").searchPrefill("?tag=(tone/comment-australia-news/australia-news)")
  )
  .swatch(Opinion)
  
  //News Features and Long reads
  
  def FrontNewsFeaturesAu = front(
    "News Features",
    Some("au"),
    collection("Long Read").searchPrefill("?tag=news/series/the-long-read"),
    collection("News Features").searchPrefill("?tag=(tone/news,tone/features)")
  )
  .swatch(News)
  
  // Culture and Life
  // We're going to need more collections
  
  def FrontCultureAu = front(
    "Culture",
    Some("au"),
    collection("Culture").searchPrefill("?tag=tone/features|tone/interviews,-tone/reviews+(music/music|books/books|stage/stage|music/classical-music-and-opera|artanddesign/artanddesign|games/games|tv-and-radio/tv-and-radio|film/film|culture/culture)")
  )
  .swatch(Culture)
  
  def FrontLifeAu = front(
    "Life",
    Some("au"),
    collection("Life").searchPrefill("?tag=tone/features|tone/recipes+(lifeandstyle/lifeandstyle|lifeandstyle/love-and-sex|lifeandstyle/celebrity|food/food|/travel/travel|lifeandstyle/health-and-wellbeing|lifeandstyle/women|lifeandstyle/home-and-garden|money/money|technology/motoring|fashion/fashion)")
  )
  .swatch(Life)
  
  // Sport
  
  def FrontSportAu = front(
    "Sport",
    Some("au"),
    collection("Sport 1").searchPrefill("?tag=sport/sport|football/football|football/w-league|sport/horse-racing|sport/rugbyleague|sport/boxing|sport/golf|sport/formulaone|sport/cycling|sport/tennis|sport/cricket|sport/rugby-union|sport/australian-rules-football"),
    collection("Sport 2"),
    collection("Sport 3")
  )
  .swatch(Sport)
  
  // Crosswords
  
  def FrontCrosswordsAu = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword")
  )
}
