package model.editions.templates

import java.time.ZoneId

import model.editions._

object DailyEdition {
  val template = EditionTemplate(
    List(
      FrontSpecialSpecial1.front -> Daily(),
      FrontTopStories.front -> Daily(),
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
      FrontLifeMagazineObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontBooks.front -> WeekDays(List(WeekDay.Sat)),
      FrontFood.front -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver.front -> WeekDays(List(WeekDay.Sun)),
      FrontSportGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontSportObserver.front -> WeekDays(List(WeekDay.Sun)),
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
    name = "special/special1",
    collections = List(collectionSpecialSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation,
    hidden = true
  )
}

object FrontTopStories {
   val collectionTopStories = CollectionTemplate(
    name = "Top Stories",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "topstories/topstories",
    collections = List(collectionTopStories),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsUkGuardian {
   val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill =  Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories")),
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
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media")),
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
    name = "news/uknewsguardian",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsUkNewsGuardian, collectionNewsUkFinancial, collectionNewsWeather),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "new/worldnewsguardian",
    collections = List(collectionNewsWorldGuardian, collectionNewsWorldFinancialGuardian, collectionNewsWorldSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsUkObserver {
  val collectionNewsUkNewsObserver = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/uknews")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkFinancialObserver = CollectionTemplate(
    name = "UK Financial",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/business")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkNewsSpecial2 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "new/uknewsobserver",
    collections = List(collectionNewsUkNewsObserver, collectionNewsUkFinancialObserver, collectionNewsUkNewsSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "new/worldnewsobserver",
    collections = List(collectionNewsWorldObserver, collectionNewsWorldBusinessObserver, collectionNewsWorldSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontJournal {
  val collectionJournalLongRead = CollectionTemplate(
    name = "The Long Read",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/journal/the-long-read")),
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
    name = "opinion/journal",
    collections = List(collectionJournalLongRead, collectionJournalComment, collectionJournalLetters, collectionJournalObits, collectionJournalSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontComment {
  val collectionOpinionComment = CollectionTemplate(
    name = "Comment",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/news/comment")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionOpinionAgenda = CollectionTemplate(
    name = "Agenda",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/agenda")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionOpinionSpecial1 = CollectionTemplate(
    name = "Comment Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "opinion/comment",
    collections = List(collectionOpinionComment, collectionOpinionAgenda, collectionOpinionSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontCulture {
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial1 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "culture/arts",
    collections = List(collectionCultureArts, collectionCultureSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
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
  val collectionCultureSpecial2 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "culture/filmandmusic",
    collections = List(collectionCultureFilm, collectionCultureMusic, collectionCultureSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "culture/guide",
    collections = List(collectionCultureFeatures, collectionCulturePreview, collectionCultureTVandRadio, collectionCultureSpecial3),
    presentation = TemplateDefaults.defaultFrontPresentation
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
  val collectionCultureCritics = CollectionTemplate(
    name = "Critics",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/critics")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureBooks = CollectionTemplate(
    name = "Books",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/new-review/books")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureSpecial3 = CollectionTemplate(
    name = "Life Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "culture/newreview",
    collections = List(collectionCultureFeatures, collectionCultureScience, collectionCultureCritics, collectionCultureBooks, collectionCultureSpecial3),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontLife {
  val collectionLifeFeatures = CollectionTemplate(
    name = "Features",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLifeSpecial1 = CollectionTemplate(
    name = "Culture Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "life/features",
    collections = List(collectionLifeFeatures, collectionLifeTVandRadio, collectionLifeSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
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
  val collectionLifeSpecial2 = CollectionTemplate(
    name = "Life Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "life/weekend",
    collections = List(collectionLifeWeekend, collectionLifeFamily, collectionLifeSpace, collectionLifeFashion, collectionLifeBody, collectionLifeSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "life/magazine",
    collections = List(collectionLifeMagazineFeatures, collectionLifeLifeStyle, collectionLifeSpecial3),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontBooks {
  val collectionBooksSaturdayReview = CollectionTemplate(
    name = "Saturday Review",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/guardianreview/saturdayreviewsfeatres")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionBooksSpecial1 = CollectionTemplate(
    name = "Books Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "review/books",
    collections = List(collectionBooksSaturdayReview, collectionBooksSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "food/food",
    collections = List(collectionFeast, collectionFoodSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontFoodObserver {
  val collectionFood = CollectionTemplate(
    name = "Food",
    prefill = Some(CapiPrefillQuery("?tag=theobserver/magazine/life-and-style,food/food")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFoodSpecial2 = CollectionTemplate(
    name = "Food Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val front = FrontTemplate(
    name = "food/observerfood",
    collections = List(collectionFood, collectionFoodSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "sport/sport",
    collections = List(collectionSport, collectionSportSpecial1),
    presentation = TemplateDefaults.defaultFrontPresentation
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
    name = "sport/observersport",
    collections = List(collectionObsSport, collectionSportSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontCrosswords {
  val collectionCrosswords = CollectionTemplate(
    name = "Crosswords",
    prefill = Some(CapiPrefillQuery("?tag=type/crossword")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "crosswords/crossword",
    collections = List(collectionCrosswords),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}
