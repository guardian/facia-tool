package fixtures

import java.time.ZoneId

import model.editions.templates.TemplateHelpers.Defaults._
import model.editions._

object TestEdition {
  val template = EditionTemplate(
    List(
      FrontTopStories.front -> Daily(),
      FrontNewsUkGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsUkGuardianSaturday.front -> WeekDays(List(WeekDay.Sat)),
      FrontCulture.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontSpecialSpecial2.front -> Daily(),
    ),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -1,
        endOffset= -2)
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    None
  )

  lazy val templates: Map[Edition, EditionTemplate] = Map(Edition.TrainingEdition -> template)
}

object FrontTopStories {
  val collectionTopStories = CollectionTemplate(
    name = "Top Stories",
    prefill = None,
    presentation = defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Top Stories",
    collections = List(collectionTopStories),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontNewsUkGuardian {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val collectionNewsUkNewsGuardian = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media|theguardian/guardian-members/guardian-members", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsUkNewsGuardian, collectionNewsWeather),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontNewsUkGuardianSaturday {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val collectionNewsSpecial1 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsWeather),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontCulture {
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureArts, collectionCultureTVandRadio),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontSpecialSpecial2 {
  val collectionSpecialSpecial2 = CollectionTemplate(
    name = "Special",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement", PathType.PrintSent)),
    presentation = defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Special 2",
    collections = List(collectionSpecialSpecial2),
    presentation = defaultFrontPresentation,
    None,
    hidden = true
  )
}
