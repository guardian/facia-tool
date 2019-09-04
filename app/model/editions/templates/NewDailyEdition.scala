package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import TemplateHelpers._

//noinspection TypeAnnotation
object NewDailyEdition {
  val template = EditionTemplate(
    List(
      FrontSpecial1 -> Daily(),
      FrontTopStories -> Daily(),
      FrontSpecial2 -> Daily(),
      FrontNewsUkGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsUkGuardianSaturday -> WeekDays(List(WeekDay.Sat)),
      FrontNewsWorldGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsUkObserver -> WeekDays(List(WeekDay.Sun)),
      FrontNewsWorldObserver -> WeekDays(List(WeekDay.Sun)),
      FrontJournal -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontComment -> WeekDays(List(WeekDay.Sun)),
      FrontCulture -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontCultureFilmMusic -> WeekDays(List(WeekDay.Fri)),
      FrontCultureGuide -> WeekDays(List(WeekDay.Sat)),
      FrontCultureNewReview -> WeekDays(List(WeekDay.Sun)),
      FrontLife -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontBooks -> WeekDays(List(WeekDay.Sat, WeekDay.Sun)),
      FrontLifeWeekend -> WeekDays(List(WeekDay.Sat)),
      FrontLifeMagazineObserver -> WeekDays(List(WeekDay.Sun)),
      FrontFood -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver -> WeekDays(List(WeekDay.Sun)),
      FrontLifeFashion -> WeekDays(List(WeekDay.Sat)),
      FrontSpecial3 -> Daily(),
      FrontSportGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontSportObserver -> WeekDays(List(WeekDay.Sun)),
      FrontSpecial4 -> Daily(),
      FrontCrosswords -> Daily(),
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily()
  )

  def FrontSpecial1 = specialFront("Special 1", Special)

  def FrontTopStories = front(
    "Top stories",
    collection("Top stories")
  )

  def FrontSpecial2 = specialFront("Special 2", Special)

  def FrontNewsUkGuardian = front(
    "National",
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("UK News").printSentAnyTag("theguardian/mainsection/uknews", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("UK Financial").printSentAnyTag("theguardian/mainsection/financial3"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")
  )
  .swatch(News)

  def FrontNewsUkGuardianSaturday = front(
    "National",
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("UK News").printSentAnyTag("theguardian/mainsection/uknews", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("Week in Review").printSentAnyTag("theguardian/mainsection/week-in-review"),
    collection("UK Financial").printSentAnyTag("theguardian/mainsection/financial3"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")
  )
  .swatch(News)

  def FrontNewsWorldGuardian = front(
    "World",
    collection("World News").printSentAnyTag("theguardian/mainsection/international"),
    collection("World Financial"),
    collection("World Special").special
  )
  .swatch(News)

  def FrontNewsUkObserver = front(
    "National",
    collection("Front Page"),
    collection("UK News").printSentAnyTag("theobserver/news/uknews"),
    collection("Business & Cash").printSentAnyTag("theobserver/news/business", "theobserver/news/cash"),
    collection("Focus").printSentAnyTag("theobserver/news/focus").special,
    collection("News Special").special,
  )
  .swatch(News)

  def FrontNewsWorldObserver = front(
    "World",
    collection("World News").printSentAnyTag("theobserver/news/worldnews"),
    collection("World Business"),
    collection("World Special").special,
  )
  .swatch(News)

  def FrontJournal = front(
    "Journal",
    collection("Features").printSentAnyTag("theguardian/journal/the-long-read", "theguardian/journal/features"),
    collection("Comment").printSentAnyTag("theguardian/journal/opinion"),
    collection("Letters").printSentAnyTag("theguardian/journal/letters"),
    collection("Obits").printSentAnyTag("theguardian/journal/obituaries"),
    collection("Journal Special").special,
  )
  .swatch(Opinion)

  def FrontComment = front(
    "Journal",
    collection("Comment").printSentAnyTag("theobserver/news/comment"),
    collection("Comment Special").special,
  )
  .swatch(Opinion)

  def FrontCulture = front(
    "Culture",
    collection("Arts").printSentAnyTag("theguardian/g2/arts"),
    collection("TV & Radio").printSentAnyTag("theguardian/g2/tvandradio"),
    collection("Culture Special").special,
  )
  .swatch(Culture)

  def FrontCultureFilmMusic = front(
    "Culture",
    collection("Film").printSentAnyTag("theguardian/g2/film"),
    collection("Music").printSentAnyTag("theguardian/g2/music"),
    collection("Arts").printSentAnyTag("theguardian/g2/arts"),
    collection("TV & Radio").printSentAnyTag("theguardian/g2/tvandradio"),
    collection("Culture Special"),
  )
  .swatch(Culture)

  def FrontCultureGuide = front(
    "Culture",
    collection("Features").printSentAnyTag("theguardian/theguide/features"),
    collection("Preview").printSentAnyTag("theguardian/theguide/reviews"),
    collection("TV and Radio").printSentAnyTag("theguardian/theguide/tv-radio"),
    collection("Culture Special"),
  )
  .swatch(Culture)

  def FrontCultureNewReview = front(
    "Culture",
    collection("Features").printSentAnyTag("theobserver/new-review/features"),
    collection("Agenda").printSentAnyTag("theobserver/new-review/agenda"),
    collection("Science & Technology").printSentAnyTag("theobserver/new-review/discover"),
    collection("Critics").printSentAnyTag("theobserver/new-review/critics"),
    collection("Life Special").special,
  )
  .swatch(Culture)

  def FrontLife = front(
    "Life",
    collection("Features").printSentAnyTag("theguardian/g2/features"),
    collection("Life Special").special,
  )
  .swatch(Lifestyle)

  def FrontLifeFashion = front(
    "The Fashion",
    collection("Fashion 1").printSentAnyTag("theguardian/the-fashion/the-fashion"),
    collection("Fashion 2").special,
    collection("Fashion 3").special,
  )
  .hide
  .swatch(Lifestyle)

  def FrontLifeWeekend = front(
    "Life",
    collection("Weekend").printSentAnyTag("theguardian/weekend/starters", "theguardian/weekend/features2", "theguardian/weekend/back"),
    collection("Family").printSentAnyTag("theguardian/weekend/family"),
    collection("Space").printSentAnyTag("theguardian/weekend/space2"),
    collection("Fashion & Beauty").printSentAnyTag("theguardian/weekend/fashion-and-beauty"),
    collection("Body & Mind").printSentAnyTag("theguardian/weekend/body-and-mind"),
    collection("Travel").printSentAnyTag("theguardian/travel/travel"),
    collection("Money").printSentAnyTag("theguardian/mainsection/money"),
    collection("Life Special").special,
  )
  .swatch(Lifestyle)

  def FrontLifeMagazineObserver = front(
    "Life",
    collection("Features").printSentAnyTag("theobserver/magazine/features2"),
    collection("Life & Style").printSentAllTags("theobserver/magazine/life-and-style", "-food/food"),
    collection("Life Special").printSentAnyTag("theobserver/design/design").special,
  )
  .swatch(Lifestyle)

  def FrontBooks = front(
    "Books",
    collection("Books").printSentAnyTag("theguardian/guardianreview/saturdayreviewsfeatres", "theobserver/new-review/books"),
    collection("Books Special").special,
  )
  .swatch(Culture)

  def FrontFood = front(
    "Food",
    collection("Food").printSentAnyTag("theguardian/feast/feast"),
    collection("Food Special").special,
  )
  .swatch(Lifestyle)

  def FrontFoodObserver = front(
    "Food",
    collection("Food").printSentAllTags("theobserver/magazine/life-and-style", "food/food"),
    collection("OFM").printSentAnyTag("theobserver/foodmonthly/features", "theobserver/foodmonthly").special,
    collection("Food Special").special,
  )
  .swatch(Lifestyle)

  def FrontSpecial3 = specialFront("Special 3", Neutral)

  def FrontSportGuardian = front(
    "Sport",
    collection("Sport").printSentAnyTag("theguardian/sport/news"),
    collection("Sport Special").special,
  )
  .swatch(Sport)

  def FrontSportObserver = front(
    "Sport",
    collection("Sport").printSentAnyTag("theobserver/sport/news"),
    collection("Sport Special").special,
  )
  .swatch(Sport)

  def FrontSpecial4 = specialFront(
    "Special 4",
    swatch = Neutral,
    prefill = Some(CapiPrefillQuery("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement", PathType.PrintSent))
  )

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword"),
  )
}
