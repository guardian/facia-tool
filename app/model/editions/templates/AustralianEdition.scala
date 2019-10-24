package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import model.editions.CapiPrefillQuery._

//noinspection TypeAnnotation
object AustralianEdition {
  lazy val template = EditionTemplate(
    List(
      FrontTopStoriesAu -> WeekDays(List(WeekDay.Sat)),
      FrontNewsAu -> WeekDays(List(WeekDay.Sat)),
      FrontJournalAu -> WeekDays(List(WeekDay.Sat)),
      FrontNewsFeaturesAu -> WeekDays(List(WeekDay.Sat)),
      FrontCultureAu -> WeekDays(List(WeekDay.Sat)),
      FrontLifeAu -> WeekDays(List(WeekDay.Sat)),
      FrontSportAu -> WeekDays(List(WeekDay.Sat)),
      FrontCrosswordsAu -> WeekDays(List(WeekDay.Sat))
    ),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0
      )
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = WeekDays(List(WeekDay.Sat)),
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = "fronts" + not + "editions" + not + "au",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -6,
        endOffset = 0
      ))
    )
  )


  // Manually curated top stories section

  def FrontTopStoriesAu = front(
    "Top stories",
    collection("Top Stories")
    )
  .swatch(News)

  // News container driven from the tone tag, this is going to be too long as is
  // Need to limit prefill duration by container as well as front?

  def FrontNewsAu = front(
    "News",
    Some("au"),
    collection("News")      .searchPrefill(allNewsTag + and + australiaNews),
    collection("World News").searchPrefill(allNewsTag + or + comments + and + not + australiaNews)
  )
  .swatch(News)

  //Opinion

  def FrontJournalAu = front(
    "Journal",
    Some("au"),
    collection("Opinion").searchPrefill(australiaNews + and + comments),
    collection("World Opinion").searchPrefill(comments + and + not + australiaNews)
  )
  .swatch(Opinion)

  //News Features and Long reads

  def FrontNewsFeaturesAu = {

    front(
      "News Features",
      Some("au"),
      collection("Long Read").searchPrefill(longReadTag),
      collection("News Features").searchPrefill("(" + allNewsTag + and + features + ")")
    )
      .swatch(News)
  }

  // Culture and Life
  // We're going to need more collections

  def FrontCultureAu = {
    front(
      "Culture",
      Some("au"),
      collection("Culture").searchPrefill(
        "(" + features +
          or + interviews +
          and + not + reviews +
          ")" + and +
          "(" +
          music +
          or + books +
          or + stage +
          or + classicalMusicAndOpera +
          or + artAndDesign +
          or + games +
          or + tvAndRadio +
          or + film +
          or + culture
      + ")")
    )
      .swatch(Culture)
  }

  def FrontLifeAu = {
    front(
      "Life",
      Some("au"),
      collection("Life").searchPrefill(
        "(" + features +
          or + recipes +
          ")" + and +
          "(" +
          lifeAndStyle +
          or + loveAndSex +
          or + celebrity +
          or + food +
          or + travel +
          or + healthAndWellbeing +
          or + women +
          or + homeAndGarden +
          or + money +
          or + technologyMotoring +
          or + fashion + ")"
      )
    )
      .swatch(Lifestyle)
  }

  // Sport

  def FrontSportAu = {

    front(
      "Sport",
      Some("au"),
      collection("Sport 1").searchPrefill(
        sport +
          or + football +
          or + womensLeagueFootball +
          or + horseracing +
          or + rugbyLeague +
          or + boxing +
          or + golf +
          or + formulaOne +
          or + cycling +
          or + tennis +
          or + cricket +
          or + rugbyUnion +
          or + australianRulesFootball),
      collection("Sport 2"),
      collection("Sport 3")
    )
      .swatch(Sport)
  }

  // Crosswords

  def FrontCrosswordsAu = {
    front(
      "Crosswords",
      collection("Crosswords").searchPrefill(crossword)
    )
  }
}
