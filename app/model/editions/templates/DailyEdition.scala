package model.editions.templates

import java.time.{ZoneId, ZonedDateTime}

import model.editions._

object DailyEdition {
  val template = EditionTemplate(
    List(
      FrontSpecialSpecial1.front -> Daily(),
      FrontTopStories.front -> Daily()),
      FrontNewsUkGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsWorldGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsUkObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontNewsWorldObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontJournal.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontComment.front -> WeekDays(List(WeekDay.Sun)),
      FrontCulture.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontCultureFilmMusic.front -> WeekDays(List(WeekDay.Sat)),
      FrontCultureGuide.front -> WeekDays(List(WeekDay.Sat)),
      FrontCultureNewReview.front -> WeekDays(List(WeekDay.Sun)),
      FrontLife.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontLifeWeekend.front -> WeekDays(List(WeekDay.Sat)),
      FrontLifeMagazine.front -> WeekDays(List(WeekDay.Sun)),
      FrontBooks.front -> WeekDays(List(WeekDay.Sat)),
      FrontFood.front -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontSportGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontSportObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontSpecialFashionMagazine.front -> WeekDays(List(WeekDay.Sun))
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily()
  )
}

object FrontSpecialSpecial1 {
  val front = FrontTemplate(
    name = "special/special1",
    collections = List(collectionSpecialSpecial1),
    presentation = DailyEdition.defaultFrontPresentation,
    hidden = true
  )
   val collectionSpecialSpecial1 = CollectionTemplate(
    name = "Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
}

object FrontTopStories {
  val front = FrontTemplate(
    name = "topstories/topstories",
    collections = List(collectionTopStories),
    presentation = DailyEdition.defaultFrontPresentation
  )
   val collectionTopStories = CollectionTemplate(
    name = "Top Stories",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
}

object FrontNewsUkGuardian {
  val front = FrontTemplate(
    name = "news/uknewsguardian",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsUkNewsGuardian, collectionNewsUkFinancial, collectionNewsWeather),
    presentation = DailyEdition.defaultFrontPresentation
  )
   val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill =  Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsSpecial1 = CollectionTemplate(
    name = "News Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsUkNewsGuardian = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsUkFinancial = CollectionTemplate(
    name = "UK Financial",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/financial3")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
}

object FrontNewsWorldGuardian {
  val front = FrontTemplate(
    name = "new/worldnewsguardian",
    collections = List(collectionNewsWorldGuardian, collectionNewsWorldFinancialGuardian, collectionNewsWorldSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionNewsWorldGuardian = CollectionTemplate(
    name = "World News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/international")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsWorldFinancialGuardian = CollectionTemplate(
    name = "World Financial",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsWorldSpecial1 = CollectionTemplate(
    name = "World Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontNewsUkObserver {
  val front = FrontTemplate(
    name = "new/uknewsobserver",
    collections = List(collectionNewsUkNewsObserver, collectionNewsUkFinancialObserver, collectionNewsUkNewsSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionNewsUkNewsObserver = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/uknews")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsUkFinancialObserver = CollectionTemplate(
    name = "UK Financial",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/business")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsUkNewsSpecial2 = CollectionTemplate(
    name = "News Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontNewsWorldObserver {
  val front = FrontTemplate(
    name = "new/worldnewsobserver",
    collections = List(collectionNewsWorldObserver, collectionNewsWorldBusinessObserver, collectionNewsWorldSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionNewsWorldObserver = CollectionTemplate(
    name = "World News",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/worldnews")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsWorldBusinessObserver = CollectionTemplate(
    name = "World Business",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionNewsWorldSpecial2 = CollectionTemplate(
    name = "World Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontJournal {
  val front = FrontTemplate(
    name = "opinion/journal",
    collections = List(collectionJournalLongRead, collectionJournalComment, collectionJournalLetters, collectionJournalObits, collectionJournalSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionJournalLongRead = CollectionTemplate(
    name = "The Long Read",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/the-long-read")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionJournalComment = CollectionTemplate(
    name = "Comment",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/opinion")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionJournalLetters = CollectionTemplate(
    name = "Letters",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/letters")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionJournalObits = CollectionTemplate(
    name = "Obits",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/obituaries")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionJournalSpecial1 = CollectionTemplate(
    name = "Journal Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontComment {
  val front = FrontTemplate(
    name = "opinion/comment",
    collections = List(collectionOpinionComment, collectionOpinionAgenda, collectionOpinionSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionOpinionComment = CollectionTemplate(
    name = "Comment",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/comment")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionOpinionAgenda = CollectionTemplate(
    name = "Agenda",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/agenda")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionOpinionSpecial1 = CollectionTemplate(
    name = "Comment Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontCulture {
  val front = FrontTemplate(
    name = "culture/arts",
    collections = List(collectionCultureArts, collectionCultureSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureSpecial1 = CollectionTemplate(
    name = "Culture Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontCultureFilmMusic {
  val front = FrontTemplate(
    name = "culture/filmandmusic",
    collections = List(collectionCultureFilm, collectionCultureMusic, collectionCultureSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionCultureFilm = CollectionTemplate(
    name = "Film",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/film")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureMusic = CollectionTemplate(
    name = "Music",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/music")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureSpecial2 = CollectionTemplate(
    name = "Culture Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
}

object FrontCultureGuide {
  val front = FrontTemplate(
    name = "culture/guide",
    collections = List(collectionCultureFeatures, collectionCulturePreview, collectionCultureTVandRadio, collectionCultureSpecial3),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionCultureFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/features")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCulturePreview = CollectionTemplate(
    name = "Preview",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/reviews")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV and Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/theguide/tv-radio")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureSpecial3 = CollectionTemplate(
    name = "Culture Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation
  )
}

object FrontCultureNewReview {
  val front = FrontTemplate(
    name = "culture/newreview",
    collections = List(collectionCultureFeatures, collectionCultureScience, collectionCultureCritics, collectionCultureBooks, collectionCultureSpecial3),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionCultureFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/features")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureScience = CollectionTemplate(
    name = "Science & Technology",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/discover")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureCritics = CollectionTemplate(
    name = "Critics",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/critics")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureBooks = CollectionTemplate(
    name = "Books",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/books")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionCultureSpecial3 = CollectionTemplate(
    name = "Life Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontLife {
  val front = FrontTemplate(
    name = "life/features",
    collections = List(collectionLifeFeatures, collectionLifeTVandRadio, collectionLifeSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionLifeFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/features")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeSpecial1 = CollectionTemplate(
    name = "Culture Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontLifeWeekend {
  val front = FrontTemplate(
    name = "life/weekend",
    collections = List(collectionLifeWeekend, collectionLifeFamily, collectionLifeSpace, collectionLifeFashion, collectionLifeBody, collectionLifeSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionLifeWeekend = CollectionTemplate(
    name = "Weekend",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/starters|theguardian/weekend/features2|theguardian/weekend/back")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeFamily = CollectionTemplate(
    name = "Family",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/family")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeSpace = CollectionTemplate(
    name = "Space",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/space2")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeFashion = CollectionTemplate(
    name = "Fashion & Beauty",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/fashion-and-beauty")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeBody = CollectionTemplate(
    name = "Body & Mind",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/weekend/body-and-mind")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeSpecial2 = CollectionTemplate(
    name = "Life Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontLifeMagazine {
  val front = FrontTemplate(
    name = "life/magazine",
    collections = List(collectionLifeMagazineFeatures, collectionLifeLifeStyle, collectionLifeSpecial3),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionLifeMagazineFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/features2")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeLifeStyle = CollectionTemplate(
    name = "Life & Style",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/life-and-style,-food/food")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLifeSpecial3 = CollectionTemplate(
    name = "Life Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontBooks {
  val front = FrontTemplate(
    name = "review/books",
    collections = List(collectionBooksSaturdayReview, collectionBooksSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionBooksSaturdayReview = CollectionTemplate(
    name = "Saturday Review",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/guardianreview/saturdayreviewsfeatres")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionBooksSpecial1 = CollectionTemplate(
    name = "Books Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontFood {
  val front = FrontTemplate(
    name = "food/food",
    collections = List(collectionFeast, collectionFoodSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionFeast = CollectionTemplate(
    name = "Feast",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/feast/feast")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFoodSpecial1 = CollectionTemplate(
    name = "Food Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontFoodObserver {
  val front = FrontTemplate(
    name = "food/observerfood",
    collections = List(collectionFood, collectionFoodSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionFood = CollectionTemplate(
    name = "Food",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/life-and-style,food/food")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFoodSpecial2 = CollectionTemplate(
    name = "Food Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontSportGuardian {
  val front = FrontTemplate(
    name = "sport/sport",
    collections = List(collectionSport, collectionSportSpecial1),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/sport/news")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionSportSpecial1 = CollectionTemplate(
    name = "Sport Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}

object FrontSportObserver {
  val front = FrontTemplate(
    name = "sport/observersport",
    collections = List(collectionObsSport, collectionSportSpecial2),
    presentation = DailyEdition.defaultFrontPresentation
  )
  val collectionObsSport = CollectionTemplate(
    name = "Sport",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/sport/news")),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionSportSpecial2 = CollectionTemplate(
    name = "Sport Special",
    prefill = none,
    presentation = DailyEdition.defaultCollectionPresentation,
    hidden = true
  )
}
