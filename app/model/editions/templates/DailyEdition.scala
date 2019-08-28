package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._

object DailyEdition {
  val template = EditionTemplate(
    List(
      FrontSpecialSpecial1.front -> Daily(),
      FrontTopStories.front -> Daily(),
      FrontNewsUkGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsUkGuardianSaturday.front -> WeekDays(List(WeekDay.Sat)),
      FrontNewsWorldGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsUkObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontNewsWorldObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontJournal.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontComment.front -> WeekDays(List(WeekDay.Sun)),
      FrontCulture.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontCultureFilmMusic.front -> WeekDays(List(WeekDay.Fri)),
      FrontCultureGuide.front -> WeekDays(List(WeekDay.Sat)),
      FrontCultureNewReview.front -> WeekDays(List(WeekDay.Sun)),
      FrontLife.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontBooks.front -> WeekDays(List(WeekDay.Sat, WeekDay.Sun)),
      FrontLifeWeekend.front -> WeekDays(List(WeekDay.Sat)),
      FrontLifeMagazineObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontFood.front -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontLifeFashion.front -> WeekDays(List(WeekDay.Sat)),
      FrontSportGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontSportObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontSpecialSpecial2.front -> Daily(),
      FrontCrosswords.front -> Daily(),
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily()
  )
}

object FrontSpecialSpecial1 {
  val collectionSpecialSpecial1 = CollectionTemplate(
    name = "Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Special 1",
    collections = List(collectionSpecialSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation,
    hidden = true,
    isSpecial = true
  )
}

object FrontTopStories {
  val collectionTopStories = CollectionTemplate(
    name = "Top Stories",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Top Stories",
    collections = List(collectionTopStories),
    presentation = FrontPresentation(Neutral),
  )
}

object FrontNewsUkGuardian {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsSpecial1 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsUkNewsGuardian = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media|theguardian/guardian-members/guardian-members")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkFinancial = CollectionTemplate(
    name = "UK Financial",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/financial3")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsUkNewsGuardian, collectionNewsUkFinancial, collectionNewsWeather),
    presentation = FrontPresentation(News)
  )
}

object FrontNewsUkGuardianSaturday {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsSpecial1 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsUkNewsGuardian = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media|theguardian/guardian-members/guardian-members")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWeekInReviewGuardian = CollectionTemplate(
    name = "Week in Review",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/week-in-review")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkFinancial = CollectionTemplate(
    name = "UK Financial",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/financial3")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsUkNewsGuardian, collectionNewsWeekInReviewGuardian, collectionNewsUkFinancial, collectionNewsWeather),
    presentation = FrontPresentation(News)
  )
}


object FrontNewsWorldGuardian {
  val collectionNewsWorldGuardian = CollectionTemplate(
    name = "World News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/international")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWorldFinancialGuardian = CollectionTemplate(
    name = "World Financial",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWorldSpecial1 = CollectionTemplate(
    name = "World Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "World News",
    collections = List(collectionNewsWorldGuardian, collectionNewsWorldFinancialGuardian, collectionNewsWorldSpecial1),
    presentation = FrontPresentation(News)
  )
}

object FrontNewsUkObserver {
  val collectionNewsFrontPageObserver = CollectionTemplate(
    name = "Front Page",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkNewsObserver = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/uknews")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkBusinessObserver = CollectionTemplate(
    name = "Business & Cash",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/business|theobserver/news/cash")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkFocusObserver = CollectionTemplate(
    name = "Focus",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/focus")),
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsUkNewsSpecial2 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPageObserver, collectionNewsUkNewsObserver, collectionNewsUkBusinessObserver, collectionNewsUkFocusObserver, collectionNewsUkNewsSpecial2),
    presentation = FrontPresentation(News)
  )
}

object FrontNewsWorldObserver {
  val collectionNewsWorldObserver = CollectionTemplate(
    name = "World News",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/worldnews")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWorldBusinessObserver = CollectionTemplate(
    name = "World Business",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWorldSpecial2 = CollectionTemplate(
    name = "World Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "World News",
    collections = List(collectionNewsWorldObserver, collectionNewsWorldBusinessObserver, collectionNewsWorldSpecial2),
    presentation = FrontPresentation(News)
  )
}

object FrontJournal {
  val collectionJournalFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/the-long-read|theguardian/journal/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionJournalComment = CollectionTemplate(
    name = "Comment",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/opinion")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionJournalLetters = CollectionTemplate(
    name = "Letters",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/letters")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionJournalObits = CollectionTemplate(
    name = "Obits",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/obituaries")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionJournalSpecial1 = CollectionTemplate(
    name = "Journal Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Opinion",
    collections = List(collectionJournalFeatures, collectionJournalComment, collectionJournalLetters, collectionJournalObits, collectionJournalSpecial1),
    presentation = FrontPresentation(Opinion)
  )
}

object FrontComment {
  val collectionOpinionComment = CollectionTemplate(
    name = "Comment",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/comment")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionOpinionSpecial1 = CollectionTemplate(
    name = "Comment Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Opinion",
    collections = List(collectionOpinionComment, collectionOpinionSpecial1),
    presentation = FrontPresentation(Opinion)
  )
}

object FrontCulture {
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial1 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureArts, collectionCultureTVandRadio, collectionCultureSpecial1),
    presentation = FrontPresentation(Culture)
  )
}

object FrontCultureFilmMusic {
  val collectionCultureFilm = CollectionTemplate(
    name = "Film",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/film")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureMusic = CollectionTemplate(
    name = "Music",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/music")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial2 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureFilm, collectionCultureMusic, collectionCultureArts, collectionCultureTVandRadio, collectionCultureSpecial2),
    presentation = FrontPresentation(Culture)
  )
}

object FrontCultureGuide {
  val collectionCultureFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCulturePreview = CollectionTemplate(
    name = "Preview",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/reviews")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV and Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/tv-radio")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial3 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureFeatures, collectionCulturePreview, collectionCultureTVandRadio, collectionCultureSpecial3),
    presentation = FrontPresentation(Culture)
  )
}

object FrontCultureNewReview {
  val collectionCultureFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureScience = CollectionTemplate(
    name = "Science & Technology",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/discover")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureAgenda = CollectionTemplate(
    name = "Agenda",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/agenda")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureCritics = CollectionTemplate(
    name = "Critics",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/critics")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial3 = CollectionTemplate(
    name = "Life Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureFeatures, collectionCultureScience, collectionCultureAgenda, collectionCultureCritics, collectionCultureSpecial3),
    presentation = FrontPresentation(Culture)
  )
}

object FrontLife {
  val collectionLifeFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeSpecial1 = CollectionTemplate(
    name = "Life Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Lifestyle",
    collections = List(collectionLifeFeatures, collectionLifeSpecial1),
    presentation = FrontPresentation(Lifestyle)
  )
}

object FrontLifeFashion {
  val collectionLifeFashion1 = CollectionTemplate(
    name = "Fashion 1",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/the-fashion/the-fashion")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeFashion2 = CollectionTemplate(
    name = "Fashion 2",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionLifeFashion3 = CollectionTemplate(
    name = "Fashion 3",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "The Fashion",
    collections = List(collectionLifeFashion1, collectionLifeFashion2, collectionLifeFashion3),
    presentation = FrontPresentation(Lifestyle),
    hidden = true
  )
}


object FrontLifeWeekend {
  val collectionLifeWeekend = CollectionTemplate(
    name = "Weekend",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/starters|theguardian/weekend/features2|theguardian/weekend/back")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeFamily = CollectionTemplate(
    name = "Family",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/family")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeSpace = CollectionTemplate(
    name = "Space",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/space2")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeFashion = CollectionTemplate(
    name = "Fashion & Beauty",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/fashion-and-beauty")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeBody = CollectionTemplate(
    name = "Body & Mind",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/body-and-mind")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeTravel = CollectionTemplate(
    name = "Travel",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/travel/travel")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeMoney = CollectionTemplate(
    name = "Money",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/money")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeSpecial2 = CollectionTemplate(
    name = "Life Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Lifestyle",
    collections = List(collectionLifeWeekend, collectionLifeFamily, collectionLifeSpace, collectionLifeFashion, collectionLifeBody, collectionLifeTravel, collectionLifeMoney, collectionLifeSpecial2),
    presentation = FrontPresentation(Lifestyle)
  )
}


object FrontLifeMagazineObserver {
  val collectionLifeMagazineFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/features2")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeLifeStyle = CollectionTemplate(
    name = "Life & Style",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/life-and-style,-food/food")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeSpecial3 = CollectionTemplate(
    name = "Life Special",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/design/design")),
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Lifestyle",
    collections = List(collectionLifeMagazineFeatures, collectionLifeLifeStyle, collectionLifeSpecial3),
    presentation = FrontPresentation(Lifestyle)
  )
}

object FrontBooks {
  val collectionBooks = CollectionTemplate(
    name = "Books",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/guardianreview/saturdayreviewsfeatres|theobserver/new-review/books")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionBooksSpecial1 = CollectionTemplate(
    name = "Books Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Books",
    collections = List(collectionBooks, collectionBooksSpecial1),
    presentation = FrontPresentation(Culture)
  )
}

object FrontFood {
  val collectionFeast = CollectionTemplate(
    name = "Food",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/feast/feast")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFoodSpecial1 = CollectionTemplate(
    name = "Food Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Food",
    collections = List(collectionFeast, collectionFoodSpecial1),
    presentation = FrontPresentation(Lifestyle)
  )
}

object FrontFoodObserver {
  val collectionFood = CollectionTemplate(
    name = "Food",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/life-and-style,food/food")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFoodMonthly = CollectionTemplate(
    name = "OFM",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/foodmonthly/features|theobserver/foodmonthly")),
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionFoodSpecial2 = CollectionTemplate(
    name = "Food Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Food",
    collections = List(collectionFood, collectionFoodMonthly, collectionFoodSpecial2),
    presentation = FrontPresentation(Lifestyle)
  )
}

object FrontSportGuardian {
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/sport/news")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionSportSpecial1 = CollectionTemplate(
    name = "Sport Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Sport",
    collections = List(collectionSport, collectionSportSpecial1),
    presentation = FrontPresentation(Sport)
  )
}

object FrontSportObserver {
  val collectionObsSport = CollectionTemplate(
    name = "Sport",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/sport/news")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionSportSpecial2 = CollectionTemplate(
    name = "Sport Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "Sport",
    collections = List(collectionObsSport, collectionSportSpecial2),
    presentation = FrontPresentation(Sport)
  )
}

object FrontSpecialSpecial2 {
  val collectionSpecialSpecial2 = CollectionTemplate(
    name = "Special",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Special 2",
    collections = List(collectionSpecialSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation,
    hidden = true,
    isSpecial = true
  )
}

object FrontCrosswords {
  val collectionCrosswords = CollectionTemplate(
    name = "Crosswords",
    prefill = Some(CapiPrefillQuery("?tag=type/crossword", PathType.Search)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Crosswords",
    collections = List(collectionCrosswords),
    presentation = FrontPresentation(Neutral)
  )
}
