package fixtures

import java.time.ZoneId

import model.editions.templates.TemplateDefaults
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
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily()
  )

  val templates: Map[String, EditionTemplate] = Map("test-edition" -> template)
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
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsUkGuardian {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsUkNewsGuardian = CollectionTemplate(
    name = "UK News",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media|theguardian/guardian-members/guardian-members", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsUkNewsGuardian, collectionNewsWeather),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontNewsUkGuardianSaturday {
  val collectionNewsFrontPage = CollectionTemplate(
    name = "Front Page",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionNewsSpecial1 = CollectionTemplate(
    name = "News Special",
    prefill = None,
    presentation = TemplateDefaults.defaultCollectionPresentation,
    hidden = true
  )
  val collectionNewsWeather = CollectionTemplate(
    name = "Weather",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/mainsection/weather2", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsWeather),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontCulture {
  val collectionCultureArts = CollectionTemplate(
    name = "Arts",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/arts", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val collectionCultureTVandRadio = CollectionTemplate(
    name = "TV & Radio",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/g2/tvandradio", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureArts, collectionCultureTVandRadio),
    presentation = TemplateDefaults.defaultFrontPresentation
  )
}

object FrontSpecialSpecial2 {
  val collectionSpecialSpecial2 = CollectionTemplate(
    name = "Special",
    prefill = Some(CapiPrefillQuery("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement", PathType.PrintSent)),
    presentation = TemplateDefaults.defaultCollectionPresentation
  )

  val front = FrontTemplate(
    name = "Special 2",
    collections = List(collectionSpecialSpecial2),
    presentation = TemplateDefaults.defaultFrontPresentation,
    hidden = true
  )
}
