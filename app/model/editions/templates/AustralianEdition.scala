package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object AustralianEdition extends RegionalEdition {

  override val title = "Australia Weekend"
  override val subTitle = "Published from Sydney every\nSaturday by 6 am (AEST)"
  override val edition = "australian-edition"
  override val header = Header("Australia", Some("Weekend"))
  override val notificationUTCOffset = -5
  override val topic = "au"
  override val locale = Some("en_AU")

  lazy val template = EditionTemplate(
    List(
      FrontTopStoriesAu -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial1Au -> WeekDays(List(WeekDay.Sat)),
      FrontWeekendAu -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial2Au -> WeekDays(List(WeekDay.Sat)),
      FrontNationalAu -> WeekDays(List(WeekDay.Sat)),
      FrontWorldAu -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial4Au -> WeekDays(List(WeekDay.Sat)),
      FrontOpinionAu -> WeekDays(List(WeekDay.Sat)),
      FrontCultureAu -> WeekDays(List(WeekDay.Sat)),
      FrontLifeAu -> WeekDays(List(WeekDay.Sat)),
      FrontFeaturedAu -> WeekDays(List(WeekDay.Sat)),
      FrontSportAu -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsAu -> WeekDays(List(WeekDay.Sat))
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -6,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = WeekDays(List(WeekDay.Sat)),
    maybeOphanPath = Some("au"),
    ophanQueryPrefillParams = Some(
      OphanQueryPrefillParams(
        apiKey = "fronts-editions-au",
        timeWindowConfig = TimeWindowConfigInDays(
          startOffset = -6,
          endOffset = 0
        )
      )
    )
  )

  // Manually curated top stories section

  def FrontTopStoriesAu = front(
    "Top stories",
    collection("Top stories"),
    collection("Top stories"),
    collection("Top stories")
  )

  // Special 1
  def FrontSpecial1Au = specialFront("Front Special 1", News, None)

  // Spotlight - Features, Culture, Lifestyle, Comment

  def FrontWeekendAu = front(
    "Weekend",
    collection("Weekend")
      .searchPrefill(
        "?tag=type/article,(tracking/commissioningdesk/australia-features|tracking/commissioningdesk/australia-pictures-),-tone/minutebyminute"
      )
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
      .withCardItemsCap(20),
    collection("Weekend"),
    collection("Weekend"),
    collection("Weekend"),
    collection("Weekend").hide,
    collection("Weekend").hide
  )
    .swatch(Lifestyle)

  // Special 2

  def FrontSpecial2Au = specialFront("Front Special 2", Lifestyle, None)

  // National - News two containers, maybe split out politics into second container?

  def FrontNationalAu = front(
    "National",
    collection("News Features")
      .searchPrefill(
        "?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),(tone/features|tone/analysis|tone/explainer),-culture/culture,-lifestyle/lifestyle,-tone/news,-tone/comment,-tone/minutebyminute"
      )
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
      .withCardItemsCap(40),
    collection("News")
      .searchPrefill(
        "?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),-(tone/features|tone/analysis|tone/explainer),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/comment,-tone/minutebyminute"
      )
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
      .withCardItemsCap(40),
    collection("National").hide,
    collection("National").hide
  )
    .swatch(News)

  // World - International news content

  def FrontWorldAu = front(
    "World",
    collection("News Features")
      .searchPrefill(
        "?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),-tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute"
      )
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
      .withCardItemsCap(40),
    collection("News")
      .searchPrefill(
        "?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),-(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute"
      )
      .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
      .withCardItemsCap(40),
    collection("World").hide,
    collection("World").hide
  )
    .swatch(News)

  // Special 4

  def FrontSpecial4Au = specialFront("Front Special 4", News, None)

  // Opinion

  def FrontOpinionAu = front(
    "Opinion",
    collection("Opinion")
      .searchPrefill(
        "?tag=type/article,tone/comment,(australia-news/australia-news|australia-news/australian-politics|media/australia-media),-sport/sport,-tone/minutebyminute"
      )
      .withCardItemsCap(40),
    collection("Opinion").hide,
    collection("World Opinion")
      .searchPrefill(
        "?tag=type/article,tone/comment,-(australia-news/australia-news|australia-news/australian-politics|media/australia-media),-sport/sport,-tone/minutebyminute"
      )
      .withCardItemsCap(40),
    collection("World Opinion").hide
  )
    .swatch(Opinion)

  // Culture

  def FrontCultureAu = front(
    "Culture",
    collection("Culture")
      .searchPrefill(
        "?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-books/books,-music/music,-film/film,-culture/television,-artanddesign/artanddesign,-tv-and-radio/tv-and-radio"
      )
      .withCardItemsCap(10),
    collection("Culture").hide,
    collection("Film and TV")
      .searchPrefill(
        "?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-books/books,-music/music,(film/film|culture/television|tv-and-radio/tv-and-radio),-artanddesign/artanddesign"
      )
      .withCardItemsCap(10),
    collection("Music")
      .searchPrefill(
        "?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-books/books,music/music,-film/film,-culture/television,-artanddesign/artanddesign,-tv-and-radio/tv-and-radio"
      )
      .withCardItemsCap(10),
    collection("Books")
      .searchPrefill(
        "?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,books/books,-music/music,-film/film,-culture/television,-artanddesign/artanddesign,-tv-and-radio/tv-and-radio"
      )
      .withCardItemsCap(10),
    collection("Art and design")
      .searchPrefill(
        "?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-books/books,-music/music,-film/film,-culture/television,artanddesign/artanddesign,-tv-and-radio/tv-and-radio"
      )
      .withCardItemsCap(10),
    collection("Culture").hide
  )
    .swatch(Culture)

  // Life

  def FrontLifeAu = front(
    "Lifestyle",
    collection("Lifestyle")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-food/food,-lifeandstyle/family,-fashion/fashion,-lifeandstyle/health-and-wellbeing,-lifeandstyle/fitness"
      )
      .withCardItemsCap(10),
    collection("Food")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,food/food,-lifeandstyle/family,-fashion/fashion,-lifeandstyle/health-and-wellbeing,-lifeandstyle/fitness"
      )
      .withCardItemsCap(10),
    collection("Family")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-food/food,lifeandstyle/family,-fashion/fashion,-lifeandstyle/health-and-wellbeing,-lifeandstyle/fitness"
      )
      .withCardItemsCap(10),
    collection("Fashion")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-food/food,-lifeandstyle/family,fashion/fashion,-lifeandstyle/health-and-wellbeing,-lifeandstyle/fitness"
      )
      .withCardItemsCap(10),
    collection("Health")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute,-food/food,-lifeandstyle/family,-fashion/fashion,(lifeandstyle/health-and-wellbeing|lifeandstyle/fitness)"
      )
      .withCardItemsCap(10),
    collection("Lifestyle").hide,
    collection("Lifestyle").hide
  )
    .swatch(Lifestyle)

  // Featured (aka Long Reads)
  // AUS preference would be to do this by word count which we can't currently do

  def FrontFeaturedAu = front(
    "Featured",
    collection("Long reads")
      .searchPrefill(
        "?tag=type/article,news/series/the-long-read,-tone/minutebyminute"
      )
      .withCardItemsCap(40),
    collection("Featured").hide,
    collection("Featured"),
    collection("Featured").hide
  )
    .swatch(Culture)

  // Sports - commissioned

  def FrontSportAu = front(
    "Sport",
    collection("Sport")
      .searchPrefill(
        "?tag=type/article,sport/sport,(tone/comment|tone/features|tone/analysis),-tone/minutebyminute"
      )
      .withCardItemsCap(40),
    collection("Sport").hide,
    collection("Sport").hide
  )
    .swatch(Sport)

  // Crosswords - also Quizzes, not sure if this will work. Split to a separate container.

  def FrontCrosswordsAu = front(
    "Puzzles",
    collection("Crosswords")
      .searchPrefill("?tag=type/crossword")
      .withCardItemsCap(40),
    collection("Quizzes")
      .searchPrefill("?tag=tone/quizzes")
      .withCardItemsCap(40)
  )
}
