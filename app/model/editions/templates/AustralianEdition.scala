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
      FrontWeekendAu -> WeekDays(List(WeekDay.Sat)),
      FrontNationalAu -> WeekDays(List(WeekDay.Sat)),
      FrontWorldAu -> WeekDays(List(WeekDay.Sat)),
      FrontOpinionAu -> WeekDays(List(WeekDay.Sat)),
      FrontCultureLifeAu -> WeekDays(List(WeekDay.Sat)),
      FrontRecommendedAu -> WeekDays(List(WeekDay.Sat)),
      FrontSportAu -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsAu -> WeekDays(List(WeekDay.Sat))
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -6,
      endOffset = 0,
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = WeekDays(List(WeekDay.Sat)),
    maybeOphanPath = Some("au"),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = "fronts-editions-au",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0,
      ))
    )
  )


  // Manually curated top stories section

  def FrontTopStoriesAu = front(
    "Top stories",
    collection("Top Stories")
  )
    .swatch(News)

  // Weekend - Features, Culture, Lifestyle, Comment

  def FrontWeekendAu = front(
    "Weekend",
    collection("Features")
      .searchPrefill("?tag=type/article,tone/features,(tracking/commissioningdesk/australia-news|tracking/commissioningdesk/australia-features|tracking/commissioningdesk/australia-investigations|tracking/commissioningdesk/australia-business|tracking/commissioningdesk/australia-technology)"),
    collection("Culture")
      .searchPrefill("?tag=type/article,culture/culture,tracking/commissioningdesk/australia-culture,(tone/features|tone/interview|tone/reviews)"),
    collection("Lifestyle")
      .searchPrefill("?tag=type/article,lifeandstyle/australian-lifestyle,tracking/commissioningdesk/australia-lifestyle,(tone/news|tone/features)"),
    collection("Comment")
      .searchPrefill("?tag=type/article,commentisfree/commentisfree,tone/comment,(tracking/commissioningdesk/australia-opinion|tracking/commissioningdesk/australia-politics)")
  )
    .swatch(Lifestyle)

  //National - News two containers, maybe split out politics into second container?

  def FrontNationalAu = front(
    "National",
    collection("News")
      .searchPrefill("?tag=type/article,australia-news/australia-news,tone/news,(tracking/commissioningdesk/australia-politics|tracking/commissioningdesk/australia-politics)")
      .withArticleItemsCap(40),
    collection("Politics")
  )
    .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-1, 0)))
    .swatch(News)

  //World - International news content

  def FrontWorldAu = front(
    "World",
    collection("World")
      .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),tone/news,(tracking/commissioningdesk/us-news|tracking/commissioningdesk/us-foreign|tracking/commissioningdesk/uk-home-news|tracking/commissioningdesk/uk-foreign)")
      .withArticleItemsCap(40)
  )
    .swatch(News)

  // Opinion

  def FrontOpinionAu = front(
    "Opinion",
    collection("Opinion")
      .searchPrefill("?tag=type/article,commentisfree/commentisfree,tone/comment,(tracking/commissioningdesk/australia-opinion|tracking/commissioningdesk/australia-politics)")
  )
    .swatch(Culture)

  // Culture / Life - confused by the connection between this and weekend front above

  def FrontCultureLifeAu = front(
    "Culture & Lifestyle",
    collection("Culture")
      .searchPrefill("?tag=type/article,culture/culture,lifeandstyle/australian-lifestyle,(tone/features|tone/reviews|tone/news),(tracking/commissioningdesk/australia-lifestyle|tracking/commissioningdesk/australia-culture)"),
    collection("Lifestyle")
  )
    .swatch(Lifestyle)

  // Recommended Reads (aka Long Reads)

  def FrontRecommendedAu = front(
    "Recommended Reads",
    collection("Long Reads")
      .searchPrefill("?tag=type/article,news/series/the-long-read,tracking/commissioningdesk/long-read")
  )
    .swatch(Sport)

  // Sports - commissioned

  def FrontSportAu = front(
    "Sport",
    collection("Sports").searchPrefill("?tag=type/article,tracking/commissioningdesk/australia-sport,sport/australia-sport")
      .withArticleItemsCap(40)
  )
    .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-1, 0)))
    .swatch(Sport)

  // Crosswords - also Quizzes, not sure if this will work. Split to a separate container.

  def FrontCrosswordsAu = front(
    "Puzzles",
    collection("Crosswords").searchPrefill("?tag=type/crossword"),
    collection("Quizzes").searchPrefill("?tag=tone/quizzes")
  )
}
