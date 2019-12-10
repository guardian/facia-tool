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
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3"),
    collection("Collection 4")
  )
    .swatch(Lifestyle)

  //National - News two containers, maybe split out politics into second container?

  def FrontNationalAu = front(
    "National",
    collection("News Features")
      .searchPrefill("?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia),(tone/features|tone/analysis|tone/explainer),-tone/news,-tone/comment,-tone/minutebyminute")
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
      .withArticleItemsCap(40),
    collection("News")
      .searchPrefill("?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia),-(tone/features|tone/analysis|tone/explainer),tone/news,-tone/comment,-tone/minutebyminute")
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
      .withArticleItemsCap(40)
  )
    .swatch(News)

  //World - International news content

  def FrontWorldAu = front(
    "World",
    collection("News Features")
      .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),(tone/features|tone/analysis|tone/explainer),-tone/news,-tone/minutebyminute")
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
      .withArticleItemsCap(40),
    collection("News")
      .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),-(tone/features|tone/analysis|tone/explainer),tone/news,-tone/minutebyminute")
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
      .withArticleItemsCap(40)    
  )
    .swatch(News)

  // Opinion

  def FrontOpinionAu = front(
    "Opinion",
    collection("Australian Opinion")
      .searchPrefill("?tag=type/article,tone/comment,(australia-news/australia-news|australia-news/australian-politics),-tone/minutebyminute"),
    collection("Opinion")
      .searchPrefill("?tag=type/article,tone/comment,-(australia-news/australia-news|australia-news/australian-politics),-tone/minutebyminute")
  )
    .swatch(Culture)

  // Culture / Life - confused by the connection between this and weekend front above

  def FrontCultureLifeAu = front(
    "Culture & Lifestyle",
    collection("Features")
      .searchPrefill("?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute"),
    collection("News")
      .searchPrefill("?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute")
  )
    .swatch(Lifestyle)

  // Recommended Reads (aka Long Reads)
  // AUS preference would be to do this by word count which we can't currently do

  def FrontRecommendedAu = front(
    "Recommended Reads",
    collection("Long Reads")
      .searchPrefill("?tag=type/article,news/series/the-long-read,tracking/commissioningdesk/long-read,-tone/minutebyminute")
  )
    .swatch(Sport)

  // Sports - commissioned

  def FrontSportAu = front(
    "Sport",
    collection("Sport")
      .searchPrefill("?tag=type/article,sport/sport,(tone/comment|tone/features|tone/analysis),-tone/minutebyminute")
      .withArticleItemsCap(40)
  )
    .swatch(Sport)

  // Crosswords - also Quizzes, not sure if this will work. Split to a separate container.

  def FrontCrosswordsAu = front(
    "Puzzles",
    collection("Crosswords").searchPrefill("?tag=type/crossword"),
    collection("Quizzes").searchPrefill("?tag=tone/quizzes")
  )
}
