package fixtures

import java.time.ZoneId

import model.editions.templates.TemplateHelpers.Defaults._
import model.editions._
import model.editions.templates.TemplateHelpers.collection

object TestEdition {

  val CapiQueryStartOffsetInDays: Int = -1
  val CapiQueryEndOffsetInDays: Int = 2
  val UseDate: CapiDateQueryParam = CapiDateQueryParam.Published

  val template = EditionTemplate(
    List(
      FrontTopStories.front -> Daily(),
      FrontNewsUkGuardian.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsUkGuardianSaturday.front -> WeekDays(List(WeekDay.Sat)),
      FrontCulture.front -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontSpecialSpecial2.front -> Daily(),
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = CapiQueryStartOffsetInDays,
      endOffset = CapiQueryEndOffsetInDays,
    ),
    capiDateQueryParam = UseDate,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    None,
    None
  )

  lazy val templates: Map[Edition, EditionTemplate] = Map(Edition.TrainingEdition -> template)
}

object FrontTopStories {
  val collectionTopStories = collection("Top Stories")
    .printSentPrefill("?tag=theguardian/mainsection/topstories")
    .withArticleItemsCap(1)

  val collectionTopStories2 = collection("Top Stories 2")
    .withTimeWindowConfig(Some(CapiTimeWindowConfigInDays(-3, 2)))

  val front = FrontTemplate(
    name = "Top Stories",
    collections = List(collectionTopStories, collectionTopStories2),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontNewsUkGuardian {
  val collectionNewsFrontPage = collection("Front Page")
    .printSentPrefill("?tag=theguardian/mainsection/topstories")
    .withArticleItemsCap(1)

  val collectionNewsUkNewsGuardian = collection("UK News")
    .printSentPrefill("?tag=theguardian/mainsection/uknews|theguardian/mainsection/education|theguardian/mainsection/society|theguardian/mainsection/media|theguardian/guardian-members/guardian-members")
    .withArticleItemsCap(1)

  val collectionNewsWeather = collection("Weather")
    .printSentPrefill("?tag=theguardian/mainsection/weather2")
    .withArticleItemsCap(1)

  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsUkNewsGuardian, collectionNewsWeather),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontNewsUkGuardianSaturday {
  val collectionNewsFrontPage = collection("Front Page")
    .printSentPrefill("?tag=theguardian/mainsection/topstories")
    .withArticleItemsCap(1)

  val collectionNewsSpecial1 = collection("News Special").hide

  val collectionNewsWeather = collection("Weather").printSentPrefill("?tag=theguardian/mainsection/weather2").withArticleItemsCap(1)

  val front = FrontTemplate(
    name = "UK News",
    collections = List(collectionNewsFrontPage, collectionNewsSpecial1, collectionNewsWeather),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontCulture {
  val collectionCultureArts = collection("Arts")
    .printSentPrefill("?tag=theguardian/g2/arts").withArticleItemsCap(2)

  val collectionCultureTVandRadio = collection("TV & Radio")
  .printSentPrefill("?tag=theguardian/g2/tvandradio")

  val front = FrontTemplate(
    name = "Culture",
    collections = List(collectionCultureArts, collectionCultureTVandRadio),
    presentation = defaultFrontPresentation,
    None
  )
}

object FrontSpecialSpecial2 {
  val collectionSpecialSpecial2 = collection("Special")
    .printSentPrefill("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement")
      .withArticleItemsCap(4)

  val front = FrontTemplate(
    name = "Special 2",
    collections = List(collectionSpecialSpecial2),
    presentation = defaultFrontPresentation,
    None,
    hidden = true
  )
}
