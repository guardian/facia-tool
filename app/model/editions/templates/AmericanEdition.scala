package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object AmericanEdition {
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
      FrontEnivronmentUs -> WeekDays(List(WeekDay.Sat)),
      FrontCultureUs -> WeekDays(List(WeekDay.Sat)),
      FrontLifestyleUs -> WeekDays(List(WeekDay.Sat)),
      FrontSportUs -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsUs -> WeekDays(List(WeekDay.Sat))
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -6,
      endOffset = 0,
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = WeekDays(List(WeekDay.Sat)),
    maybeOphanPath = Some("us"),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = "fronts-editions-us",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0,
      ))
    )
  )


  // Manually curated top three stories section

  def FrontEssentialReadsUs = front(
    "Essential Reads",
    collection("Essential Reads")
  )
    .swatch(News)
  
  // Special 1
  
  def FrontSpecial1Us = specialFront("Front Special 1", News, None)

  // People

  def FrontPeopleUs = front(
    "People",
    collection("Interviews"),
    collection("Profiles"),
    collection("Q&A")
  )
    .swatch(Lifestyle)
  
  // Special 2
  
  def FrontSpecial2Us = specialFront("Front Special 2", Lifestyle, None)

  //Spotlight - Best Reads, News Features

  def FrontSpotlightUs = front(
    "Spotlight",
    collection("News Features"),
     // .searchPrefill("?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),(tone/features|tone/analysis|tone/explainer),-culture/culture,-lifestyle/lifestyle,-tone/news,-tone/comment,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
     // .withArticleItemsCap(40),
    collection("Features")
     // .searchPrefill("?tag=type/article,(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),-(tone/features|tone/analysis|tone/explainer),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/comment,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
     // .withArticleItemsCap(40)
  )
    .swatch(News)
  
  // Special 3
  
  def FrontSpecial3Us = specialFront("Front Special 3", News, None)

  //US News - local news content

  def FrontUsNewsUs = front(
    "US News",
    collection("News Features"),
     // .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),-tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
     // .withArticleItemsCap(40),
    collection("News")
     // .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),-(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
     // .withArticleItemsCap(40)    
  )
    .swatch(News)
  
  // Special 4
  
  def FrontSpecial4Us = specialFront("Front Special 4", News, None)

  // World News

  def FrontWorldNewsUs = front(
    "World News",
    collection("News Features"),
     // .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),-tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-5, 0)))
     // .withArticleItemsCap(40),
    collection("News")
     // .searchPrefill("?tag=type/article,(world/world|us-news/us-news|uk/uk|world/europe-news|world/africa|world/americas|world/asia-pacific|world/middleeast),-(tone/features|tone/analysis|tone/explainer),-(australia-news/australia-news|australia-news/australian-politics|australia-news/business-australia|media/australia-media),tone/news,-culture/culture,-lifestyle/lifestyle,-tone/minutebyminute")
     // .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 0)))
     // .withArticleItemsCap(40)    
  )
    .swatch(News)

  // Opinion 

  def FrontOpinionUs = front(
    "Opinion",
    collection("Opinion")
     // .searchPrefill("?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute")
     // .withArticleItemsCap(40),
  )
    .swatch(Opinion)
  
  // Environment 

  def FrontEnvironmentUs = front(
    "Environment",
    collection("Environment")
     // .searchPrefill("?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute")
     // .withArticleItemsCap(40),
  )
    .swatch(News)
  
  // Culture 

  def FrontCultureUs = front(
    "Culture",
    collection("Culture")
     // .searchPrefill("?tag=type/article,culture/culture,(tone/features|tone/reviews|tone/interview),-tone/news,-tone/minutebyminute")
     // .withArticleItemsCap(40),
  )
    .swatch(News)

  // Lifestyle

  def FrontLifestyleUs = front(
    "Lifestyle",
    collection("Lifestyle"),
     // .searchPrefill("?tag=type/article,news/series/the-long-read,-tone/minutebyminute")
     // .withArticleItemsCap(40),
    collection("Recipes")
    //  .searchPrefill("?tag=type/article,news/series/the-long-read,-tone/minutebyminute")
    //  .withArticleItemsCap(40)
  )
    .swatch(News)

  // Sports

  def FrontSportUs = front(
    "Sport",
    collection("Sport")
     // .searchPrefill("?tag=type/article,sport/sport,(tone/comment|tone/features|tone/analysis),-tone/minutebyminute")
     // .withArticleItemsCap(40)
  )
    .swatch(Sport)

  // Crosswords

  def FrontCrosswordsUs = front(
    "Puzzles",
    collection("Crosswords").searchPrefill("?tag=type/crossword")
      .withArticleItemsCap(40)
  )
}
