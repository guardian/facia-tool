package services.editions

import java.time.{ZonedDateTime, ZoneId, LocalDate}

import model.editions._
import model.editions.WeekDay._

object EditionTemplates {
  val defaultFrontPresentation = FrontPresentation()
  val defaultCollectionPresentation = CollectionPresentation()
  private val dailyEdition = EditionTemplate(
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
  val templates: Map[String, EditionTemplate] = Map(
    "dailyEdition" -> dailyEdition
  )

  val getAvailableEditions: List[String] = templates.keys.toList

  def generateEditionTemplate(
      name: String,
      localDate: LocalDate
  ): Option[EditionTemplateForDate] = {
    templates
      .get(name)
      .filter { template =>
        val date = localDate.atStartOfDay(template.zoneId)
        template.availability.isValid(date)
      }
      .map { template =>
        val date = localDate.atStartOfDay(template.zoneId)
        EditionTemplateForDate(
          template.fronts.filter(_._2.isValid(date)).map(_._1),
          date
        )
      }
  }

  private def applyPrefills(template: EditionTemplateForDate) = {
    template.fronts.map { front =>
      front.collections.map { collections =>
        collections.prefill
      }
    }
  }
}

object FrontSpecialFashionMagazine {
   val collectionFashionMagazine = CollectionTemplate(
    name = "Fashion Magazine",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "special/special",
    collections = List(collectionFashionMagazine),
    presentation = EditionTemplates.defaultFrontPresentation,
    hidden = true
  )
}

object FrontFeast {
   val collectionFeast = CollectionTemplate(
    name = "Feast",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "feast/feast",
    collections = List(collectionFeast),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontReview {
  val collectionBooks = CollectionTemplate(
    name = "Books",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "review/review",
    collections = List(collectionBooks),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontSociety {
  val collectionSociety = CollectionTemplate(
    name = "Society",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "society/society",
    collections = List(collectionSociety),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontMoney {
  val collectionMoney = CollectionTemplate(
    name = "Money",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "money/money",
    collections = List(collectionMoney),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontMedia {
  val collectionMedia = CollectionTemplate(
    name = "Media",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "media/media",
    collections = List(collectionMedia),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontEducation {
  val collectionEducation = CollectionTemplate(
    name = "Education",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "education/education",
    collections = List(collectionEducation),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontNewsNational {
  val collectionHome = CollectionTemplate(
    name = "Home",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/national",
    collections = List(collectionHome),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontFrontpage {
  val collectionFrontpage = CollectionTemplate(
    name = "Frontpage",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "frontpage/frontpage",
    collections = List(collectionFrontpage),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontNewsInternational {
  val collectionForeign = CollectionTemplate(
    name = "Foreign",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/international",
    collections = List(collectionForeign),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontNewsFinancial {
  val collectionCity = CollectionTemplate(
    name = "City",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "news/financial",
    collections = List(collectionCity),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontMusic {
  val collectionMusic = CollectionTemplate(
    name = "G2 Music",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "music/music",
    collections = List(collectionMusic),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontFilm {
  val collectionFilm = CollectionTemplate(
    name = "G2 Film",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "film/film",
    collections = List(collectionFilm),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontFeatures {
  val collectionDepartments = CollectionTemplate(
    name = "G2 Departments",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "features/features",
    collections = List(collectionDepartments),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontArts {
  // Should this be named collectionG2Arts?
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "G2 TV and Radio",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/arts",
    collections = List(collectionArts, collectionTvAndRadio),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

// This has to be done unless we have periodicity at a collection level
object FrontFridayArts {
  val collectionArts = CollectionTemplate(
    name = "G2 Arts",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "arts/artsfriday",
    collections = List(collectionArts),
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontTravel {
  val collectionTravel = CollectionTemplate(
    name = "Travel",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "travel/travel",
    collections = List(collectionTravel),
    presentation = EditionTemplates.defaultFrontPresentation,
  )
}

object FrontSport {
  val collectionSport = CollectionTemplate(
    name = "Sport",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "sport/sport",
    collections = List(collectionSport),
    presentation = EditionTemplates.defaultFrontPresentation,
  )
}

object FrontTheGuide {
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionPreviews = CollectionTemplate(
    name = "Previews",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionTvAndRadio = CollectionTemplate(
    name = "TV and Radio",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionListings = CollectionTemplate(
    name = "Listings",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "theguide/theguide",
    collections = List(collectionFeatures, collectionPreviews, collectionTvAndRadio, collectionListings),
    presentation = EditionTemplates.defaultFrontPresentation,
  )
}

object FrontCommentJournal {
  val collectionComment = CollectionTemplate(
    name = "Comment",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionLetters = CollectionTemplate(
    name = "Letters",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionLongRead = CollectionTemplate(
    name = "Long Read",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionObituaries = CollectionTemplate(
    name = "Obituaries",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionPuzzles = CollectionTemplate(
    name = "Puzzles",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
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
    presentation = EditionTemplates.defaultFrontPresentation
  )
}

object FrontWeekend {
  val collectionBack = CollectionTemplate(
    name = "Back",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionBodyAndMind = CollectionTemplate(
    name = "Body and Mind",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionFamily =CollectionTemplate(
    name = "Family",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionFashion =CollectionTemplate(
    name = "Fashion",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionStarters = CollectionTemplate(
    name = "Starters",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
  )
  val collectionSpace = CollectionTemplate(
    name = "Space",
    prefill = CapiQuery("???"),
    presentation = EditionTemplates.defaultCollectionPresentation
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
    presentation = EditionTemplates.defaultFrontPresentation
  )
}
