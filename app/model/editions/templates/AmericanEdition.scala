package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object AmericanEdition extends RegionalEdition {

  override val title = "US Weekend"
  override val subTitle =
    "Published from New York every\nSaturday morning by 6am (EST)"
  override val edition = "american-edition"
  override val header = Header("US", Some("Weekend"))
  override val notificationUTCOffset = 8
  override val topic = "us"
  override val locale = Some("en_US")

  lazy val template = EditionTemplate(
    List(
      FrontEssentialReadsUs -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial1Us -> WeekDays(List(WeekDay.Sat)),
      FrontPeopleUs -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial2Us -> WeekDays(List(WeekDay.Sat)),
      FrontSpotlightUs -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial3Us -> WeekDays(List(WeekDay.Sat)),
      FrontUsNewsUs -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial4Us -> WeekDays(List(WeekDay.Sat)),
      FrontWorldNewsUs -> WeekDays(List(WeekDay.Sat)),
      FrontOpinionUs -> WeekDays(List(WeekDay.Sat)),
      FrontEnvironmentUs -> WeekDays(List(WeekDay.Sat)),
      FrontCultureUs -> WeekDays(List(WeekDay.Sat)),
      FrontLifestyleUs -> WeekDays(List(WeekDay.Sat)),
      FrontSportUs -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsUs -> WeekDays(List(WeekDay.Sat))
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -6,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = WeekDays(List(WeekDay.Sat)),
    maybeOphanPath = Some("us"),
    ophanQueryPrefillParams = Some(
      OphanQueryPrefillParams(
        apiKey = "fronts-editions-us",
        timeWindowConfig = TimeWindowConfigInDays(
          startOffset = -6,
          endOffset = 0
        )
      )
    )
  )

  // Front: Essential Reads
  // Description: top three stories, manually curated

  def FrontEssentialReadsUs = front(
    "Essential Reads",
    collection("Essential Reads"),
    collection("Essential Reads"),
    collection("Essential Reads"),
    collection("Essential Reads").hide,
    collection("Essential Reads").hide
  )

  // Front: Special Section, News swatch
  // Description: General Special section

  def FrontSpecial1Us = specialFront("Front Special 1", News, None)

  // Front: People, Lifestyle swatch
  // Description: Interviews, profiles and Q&As

  def FrontPeopleUs = front(
    "People",
    collection("Interviews")
      .searchPrefill(
        "?tag=type/article,(tone/interview|lifeandstyle/series/experience)"
      )
      .withCardItemsCap(20),
    collection("Profiles")
      .searchPrefill("?tag=type/article,tone/profiles")
      .withCardItemsCap(20),
    collection("Q&A")
      .searchPrefill("?tag=type/article,tone/q-and-as")
      .withCardItemsCap(20),
    collection("People").hide,
    collection("People").hide
  )
    .swatch(Lifestyle)

  // Front: Special 2
  // Description: General Special section

  def FrontSpecial2Us = specialFront("Front Special 2", Lifestyle, None)

  // Front: Spotlight, News swatch
  // Description: Best Reads, News Features

  def FrontSpotlightUs = front(
    "Spotlight",
    collection("News Features"),
    collection("Features"),
    collection("Spotlight").hide,
    collection("Spotlight").hide
  )
    .swatch(News)

  // Front: Special 3, News swatch
  // Description: General Special section

  def FrontSpecial3Us = specialFront("Front Special 3", News, None)

  // Front: US News
  // Description: local news content, news swatch

  def FrontUsNewsUs = front(
    "US News",
    collection("News Features")
      .searchPrefill(
        "?tag=type/article,(us-news/us-news|us-news/us-politics|business/business|media/media|news/series/the-long-read),(tone/features|tone/analysis|tone/explainer),-culture/culture,-lifestyle/lifestyle,tone/news,-tone/comment,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("News")
      .searchPrefill(
        "?tag=type/article,(us-news/us-news|us-news/us-politics|business/business|media/media),-(tone/features|tone/analysis|tone/explainer),-culture/culture,-lifestyle/lifestyle,tone/news,-tone/comment,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("US News").hide,
    collection("US News").hide,
    collection("US News").hide
  )
    .swatch(News)

  // Front: Special 4, News swatch
  // Description: General Special section

  def FrontSpecial4Us = specialFront("Front Special 4", News, None)

  // Front: World News, News Swatch
  // Description: Non US news features and news

  def FrontWorldNewsUs = front(
    "World News",
    collection("News Features")
      .searchPrefill(
        "?tag=type/article,(world/world|australia-news/australia-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),(tone/features|tone/analysis|tone/explainer),-(us-news/us-news|us-news/us-politics|business/business|media/media),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("News")
      .searchPrefill(
        "?tag=type/article,(world/world|australia-news/australia-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),-(tone/features|tone/analysis|tone/explainer),-(us-news/us-news|us-news/us-politics|business/business|media/media),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("World News").hide,
    collection("World News").hide,
    collection("World News").hide
  )
    .swatch(News)

  // Front: Opinion
  // Description: US comment

  def FrontOpinionUs = front(
    "Opinion",
    collection("US")
      .searchPrefill(
        "?tag=type/article,tone/comment,(us-news/us-news|us-news/us-politics),-sport/sport,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("World")
      .searchPrefill(
        "?tag=type/article,tone/comment,-(us-news/us-news|us-news/us-politics),-sport/sport,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Opinion").hide,
    collection("Opinion").hide,
    collection("Opinion").hide
  )
    .swatch(Opinion)

  // Front: Environment
  // Description: Environment coverage

  def FrontEnvironmentUs = front(
    "Environment",
    collection("Environment")
      .searchPrefill(
        "?tag=type/article,environment/environment,-sport/sport,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Environment").hide,
    collection("Environment").hide,
    collection("Environment").hide,
    collection("Environment").hide
  )
    .swatch(News)

  // Front: Culture
  // Description: Culture features and reviews

  def FrontCultureUs = front(
    "Culture",
    collection("Features")
      .searchPrefill(
        "?tag=type/article,culture/culture,tone/features,-tone/reviews,-tone/news,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Reviews")
      .searchPrefill(
        "?tag=type/article,culture/culture,-tone/features,tone/reviews,-tone/news,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Culture").hide,
    collection("Culture").hide,
    collection("Culture").hide
  )
    .swatch(Culture)

  // Lifestyle

  def FrontLifestyleUs = front(
    "Lifestyle",
    collection("Lifestyle")
      .searchPrefill(
        "?tag=type/article,lifeandstyle/lifeandstyle,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Recipes")
      .searchPrefill(
        "?tag=type/article,tone/recipes,food/food,-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Lifestyle").hide,
    collection("Lifestyle").hide,
    collection("Lifestyle").hide
  )
    .swatch(Lifestyle)

  // Sports

  def FrontSportUs = front(
    "Sport",
    collection("Sport")
      .searchPrefill(
        "?tag=type/article,sport/sport,(tone/comment|tone/features|tone/analysis),-tone/minutebyminute"
      )
      .withCardItemsCap(20),
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide
  )
    .swatch(Sport)

  // Crosswords

  def FrontCrosswordsUs = front(
    "Puzzles",
    collection("Crosswords")
      .searchPrefill("?tag=type/crossword")
      .withCardItemsCap(10)
  )
}
