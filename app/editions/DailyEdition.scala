package editions

object DailyEdition {
  val defaultFrontPresentation = FrontPresentation()
  val defaultCollectionPresentation = CollectionPresentation()
  val template = EditionTemplate(
    name = "Daily Edition",
    fronts = List(
      FrontCommentJournal.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontWeekend.front -> WeekDays(List(WeekDay.Sat)),
      FrontTheGuide.front -> WeekDays(List(WeekDay.Sat)),
      FrontSport.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontTravel.front -> WeekDays(List(WeekDay.Sat)),
      FrontArts.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontFridayArts.front -> WeekDays.(List(WeekDay.Fri))
      FrontFeatures.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontFilm.front -> WeekDays(List(WeekDay.Fri)),
      FrontMusic.front -> WeekDays(List(WeekDay.Fri)),
      FrontNewsFinancial.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsInternational.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontFrontpage.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsNational.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontEducation.front -> WeekDays(List(WeekDay.Tues)),
      FrontMedia.front -> WeekDays(List(WeekDay.Mon)),
      FrontMoney.front -> WeekDays(List(WeekDay.Sat)),
      FrontSociety.front -> WeekDays(List(WeekDay.Wed)),
      FrontReview.front -> WeekDays(List(WeekDay.Sat)),
      FrontFeast.front -> WeekDays(List(WeekDay.Sat)),
      FrontSpecialFashionMagazine.front -> Daily()
    ),
    availability = Daily()
  )
}

object FrontSpecialFashionMagazine {
   val collectionFashionMagazine = CollectionTemplate(
    name = "Fashion Magazine",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "special/special",
    collections = List(collectionFashionMagazine),
    presentation = DailyEdition.defaultFrontPresentation,
    hidden = true
  )
}

object FrontFeast {
   val collectionFeast = CollectionTemplate(
    name = "Feast",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "feast/feast",
    collections = List(collectionFeast),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontReview {
  val collectionBooks = CollectionTemplate(
    name = "Books",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "review/review",
    collections = List(collectionBooks),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontSociety {
  val collectionSociety = CollectionTemplate(
    name = "Society",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "society/society",
    collections = List(collectionSociety),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontMoney {
  val collectionMoney = CollectionTemplate(
    name = "Money",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "money/money",
    collections = List(collectionMoney),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontMedia {
  val collectionEducation = CollectionTemplate(
    name = "Media",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "media/media",
    collections = List(collectionMedia),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontEducation {
  val collectionEducation = CollectionTemplate(
    name = "Education",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "education/education",
    collections = List(collectionEducation),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontNewsNational {
  val collectionHome = CollectionTemplate(
    name = "Home",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/national",
    collections = List(collectionHome),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontFrontpage {
  val collectionFrontpage = CollectionTemplate(
    name = "Frontpage",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "frontpage/frontpage",
    collections = List(collectionFrontpage),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontNewsInternational {
  val collectionForeign = CollectionTemplate(
    name = "Foreign",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/international",
    collections = List(collectionForeign),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontNewsFinancial {
  val collectionCity = CollectionTemplate(
    name = "City",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/financial",
    collections = List(collectionCity),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontMusic {
  val collectionMusic = CollectionTemplate(
    name = "G2 Music",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "music/music",
    collections = List(collectionMusic),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontFilm {
  val collectionFilm = CollectionTemplate(
    name = "G2 Film",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "film/film",
    collections = List(collectionFilm),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontFeatures {
  val collectionDepartments = CollectionTemplate(
    name = "G2 Departments",
    prefil = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "features/features",
    collections = List(collectionFeatures, collectionDepartments),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontArts {
  // Should this be named collectionG2Arts?
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "G2 TV and Radio",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/arts",
    collections = List(collectionArts, collectionTvAndRadio),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

// This has to be done unless we have periodicity at a collection level
object FrontFridayArts {
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/artsfriday",
    collections = List(collectionArts, collectionTvAndRadio),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontTravel {
  val collectionTravel = CollectionTemplate(
    name = "Travel",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "travel/travel",
    collections = List(collectionTravel),
    presentation = DailyEdition.defaultFrontPresentation,
  )
}

object FrontSport {
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "sport/sport",
    collections = List(collectionSport),
    presentation = DailyEdition.defaultFrontPresentation,
  )
}

object FrontTheGuide {
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionPreviews = CollectionTemplate(
    name = "Previews",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "TV and Radio",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionListings = CollectionTemplate(
    name = "Listings",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "theguide/theguide",
    collections = List(collectionFeatures, collectionPreviews, collectionTvAndRadio, collectionListings),
    presentation = DailyEdition.defaultFrontPresentation,
  )
}

object FrontCommentJournal {
  val collectionComment = CollectionTemplate(
    name = "Comment",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLetters = CollectionTemplate(
    name = "Letters",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLongRead = CollectionTemplate(
    name = "LongRead",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionObituaries = CollectionTemplate(
    name = "Obituaries",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionPuzzles = CollectionTemplate(
    name = "Puzzles",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "comment/journal",
    collections = List(
      collectionComment,
      collectionFeatures,
      collectionLetters,
      collectionLongRead,
      collectionObituaries,
      collectionPuzzles
    ),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontWeekend {
  val collectionBack = CollectionTemplate(
    name = "Back",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionBodyAndMind = CollectionTemplate(
    name = "BodyAndMind",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFamily =CollectionTemplate(
    name = "Family",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFashion =CollectionTemplate(
    name = "Fashion",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionStarters = CollectionTemplate(
    name = "Starters",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionSpace = CollectionTemplate(
    name = "Space",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "weekend/weekend",
    collections = List(
      collectionBack,
      collectionBodyAndMind,
      collectionFamily,
      collectionFashion,
      collectionFeatures,
      collectionStarters,
      collectionSpace
    ),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

