package editions

object DailyEdition {
  val defaultFrontPresentation = FrontPresentation()
  val defaultCollectionPresentation = CollectionPresentation()
  val template = EditionTemplate(
    name = "Daily Edition",
    fronts = List(
      FrontCommentJournal.front -> Daily(),
      FrontWeekend.front -> WeekDays(List(WeekDay.Sat)),
      FrontTheGuide.front -> Daily(),
      FrontSport.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs, Weekday.Fri)),
      FrontSaturdaySport.front -> WeekDays(List(WeekDay.Sat)),
      FrontTravel.front -> WeekDays(List(WeekDay.Sat)),
      FrontArts.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs)),
      FrontArtsEntertainment.front -> WeekDays(List(WeekDay.Fri)),
      FrontFeatures.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs)),
      FrontFilm.front -> Daily(),
      FrontMusic.front -> Daily(),
      FrontNewsFinancial.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs, Weekday.Fri, WeekDay.Sat)),
      FrontNewsInternational.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs, Weekday.Fri, WeekDay.Sat)),
      FrontFrontpage.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs, Weekday.Fri, WeekDay.Sat)),
      FrontNewsNational.front ->  WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, Weekday.Thurs, Weekday.Fri, WeekDay.Sat)),

    ),
    availability = Daily()
  )
}

object FrontNewsNational {
  val collectionHome = CollectionTemplate(
    name = "Home",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "News / National",
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
    name = "Frontpage / Frontpage",
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
    name = "News / International",
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
    name = "News / Financial",
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
    name = "Music",
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
    name = "Film",
    collections = List(collectionFilm),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontFeatures {
   val collectionFeatures = CollectionTemplate(
    name = "G2 Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionDepartments = CollectionTemplate(
    name = "G2 Departments",
    prefil = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Features",
    collections = List(collectionFeatures, collectionDepartments),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontArtsEntertainment {
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
  val collectionFeatures = CollectionTemplate(
    name = "G2 Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionDepartments = CollectionTemplate(
    name = "G2 Departments",
    prefil = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Arts Entertainment",
    collections = List(collectionArts, collectionTvAndRadio, collectionFeatures, collectionDepartments),
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
    name = "Arts",
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
    name = "Travel",
    collections = List(collectionTravel),
    presentation = DailyEdition.defaultFrontPresentation,
  )
}

object FrontSaturdaySport {
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Saturday Sport",
    collections = List(collectionSport),
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
    name = "Sport",
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
    name = "The Guide",
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
    name = "Comment / Journal",
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
    name = "Weekend",
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

