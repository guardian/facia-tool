package model.editions.templates

import java.time.{ZoneId, ZonedDateTime}

import model.editions._

object DailyEdition {
  val template = EditionTemplate(
    List(
      FrontCommentJournal.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontWeekend.front -> WeekDays(List(WeekDay.Sat)),
      FrontTheGuide.front -> WeekDays(List(WeekDay.Sat)),
      FrontSport.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontTravel.front -> WeekDays(List(WeekDay.Sat)),
      FrontArts.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontFridayArts.front -> WeekDays(List(WeekDay.Fri)),
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
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily()
  )
}

object FrontSpecialFashionMagazine {
   val collectionFashionMagazine = CollectionTemplate(
    name = "Fashion Magazine",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "special/special",
    collections = List(collectionFashionMagazine),
    presentation = TemplateDefaults.defaultFrontPresentation,
    hidden = true
  )
}

object FrontFeast {
   val collectionFeast = CollectionTemplate(
    name = "Feast",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "feast/feast",
    collections = List(collectionFeast),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontReview {
  val collectionBooks = CollectionTemplate(
    name = "Books",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "review/review",
    collections = List(collectionBooks),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontSociety {
  val collectionSociety = CollectionTemplate(
    name = "Society",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "society/society",
    collections = List(collectionSociety),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontMoney {
  val collectionMoney = CollectionTemplate(
    name = "Money",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "money/money",
    collections = List(collectionMoney),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontMedia {
  val collectionMedia = CollectionTemplate(
    name = "Media",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "media/media",
    collections = List(collectionMedia),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontEducation {
  val collectionEducation = CollectionTemplate(
    name = "Education",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "education/education",
    collections = List(collectionEducation),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsNational {
  val collectionHome = CollectionTemplate(
    name = "Home",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/national",
    collections = List(collectionHome),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontFrontpage {
  val collectionFrontpage = CollectionTemplate(
    name = "Frontpage",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "frontpage/frontpage",
    collections = List(collectionFrontpage),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsInternational {
  val collectionForeign = CollectionTemplate(
    name = "Foreign",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/international",
    collections = List(collectionForeign),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsFinancial {
  val collectionCity = CollectionTemplate(
    name = "City",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/financial",
    collections = List(collectionCity),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontMusic {
  val collectionMusic = CollectionTemplate(
    name = "G2 Music",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "music/music",
    collections = List(collectionMusic),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontFilm {
  val collectionFilm = CollectionTemplate(
    name = "G2 Film",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "film/film",
    collections = List(collectionFilm),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontFeatures {
  val collectionDepartments = CollectionTemplate(
    name = "G2 Departments",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/features")),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "features/features",
    collections = List(collectionDepartments),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontArts {
  // Should this be named collectionG2Arts?
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "G2 TV and Radio",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/arts",
    collections = List(collectionArts, collectionTvAndRadio),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

// This has to be done unless we have periodicity at a collection level
object FrontFridayArts {
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/artsfriday",
    collections = List(collectionArts),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontTravel {
  val collectionTravel = CollectionTemplate(
    name = "Travel",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "travel/travel",
    collections = List(collectionTravel),
    presentation = TemplateDefaults.defaultFrontPresentation,
  )
}

object FrontSport {
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "sport/sport",
    collections = List(collectionSport),
    presentation = TemplateDefaults.defaultFrontPresentation,
  )
}

object FrontTheGuide {
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionPreviews = CollectionTemplate(
    name = "Previews",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "TV and Radio",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionListings = CollectionTemplate(
    name = "Listings",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "theguide/theguide",
    collections = List(collectionFeatures, collectionPreviews, collectionTvAndRadio, collectionListings),
    presentation = TemplateDefaults.defaultFrontPresentation,
  )
}

object FrontCommentJournal {
  val collectionComment = CollectionTemplate(
    name = "Comment",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLetters = CollectionTemplate(
    name = "Letters",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionLongRead = CollectionTemplate(
    name = "Long Read",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionObituaries = CollectionTemplate(
    name = "Obituaries",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionPuzzles = CollectionTemplate(
    name = "Puzzles",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
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
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontWeekend {
  val collectionBack = CollectionTemplate(
    name = "Back",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionBodyAndMind = CollectionTemplate(
    name = "Body and Mind",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFamily =CollectionTemplate(
    name = "Family",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFashion =CollectionTemplate(
    name = "Fashion",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionStarters = CollectionTemplate(
    name = "Starters",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionSpace = CollectionTemplate(
    name = "Space",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation
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
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}
