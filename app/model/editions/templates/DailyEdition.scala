package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object DailyEdition {
  lazy val template = EditionTemplate(
    List(
      // Top Stories and Nuclear specials
      FrontSpecial1 -> Daily(),
      FrontTopStories -> Daily(),
      FrontSpecial2 -> Daily(),
      // News fronts then special
      FrontNewsUkGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)),
      FrontNewsUkGuardianSaturday -> WeekDays(List(WeekDay.Sat)),
      FrontNewsUkObserver -> WeekDays(List(WeekDay.Sun)),
      FrontNewsSpecial -> Daily(),
      // World News fronts and special
      FrontNewsWorldGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontNewsWorldObserver -> WeekDays(List(WeekDay.Sun)),
      FrontWorldSpecial -> Daily(),
      // Financial fronts and special
      FrontFinancialGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontFinancialObserver -> WeekDays(List(WeekDay.Sun)),
      // Journal, Comment and special
      FrontJournal -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontComment -> WeekDays(List(WeekDay.Sun)),
      FrontOpinionSpecial -> Daily(),
      // Culture fronts and special
      FrontCulture -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontCultureFilmMusic -> WeekDays(List(WeekDay.Fri)),
      FrontCultureGuide -> WeekDays(List(WeekDay.Sat)),
      FrontCultureNewReview -> WeekDays(List(WeekDay.Sun)),
      FrontBooks -> WeekDays(List(WeekDay.Sat, WeekDay.Sun)),
      FrontCultureSpecial -> Daily(),
      // Life fronts and special
      FrontLife -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)),
      FrontLifeWeekend -> WeekDays(List(WeekDay.Sat)),
      FrontTravelGuardian -> WeekDays(List(WeekDay.Sat)),
      FrontLifeMagazineObserver -> WeekDays(List(WeekDay.Sun)),
      FrontFood -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver -> WeekDays(List(WeekDay.Sun)),
      FrontLifeFashion -> WeekDays(List(WeekDay.Sat)),
      FrontLifeSpecial -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Sat, WeekDay.Sun)),
      // Sport fronts and special
      FrontSportGuardian -> WeekDays(List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri, WeekDay.Sat)),
      FrontSportObserver -> WeekDays(List(WeekDay.Sun)),
      FrontSportSpecial -> Daily(),
      // Special Supplements
      FrontSupplementSpecial1 -> Daily(),
      FrontSupplementSpecial2 -> Daily(),
      // Crosswords
      FrontCrosswords -> Daily(),
    ),
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    capiQueryPrefillParams = CapiQueryPrefillParams(
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = 0,
        endOffset = 0)
    )
  )

  def FrontSpecial1 = specialFront("Top Special 1", Neutral)

  def FrontTopStories = front(
    "Top stories",
    collection("Top stories")
  )

  def FrontSpecial2 = specialFront("Top Special 2", Neutral)

  def FrontNewsUkGuardian = front(
    "National",
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("UK News").printSentAnyTag("theguardian/mainsection/uknews", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")
  )
    .swatch(News)

  def FrontNewsUkGuardianSaturday = front(
    "National",
    collection("Front Page").printSentAnyTag("theguardian/mainsection/topstories"),
    collection("News Special").special,
    collection("UK News").printSentAnyTag("theguardian/mainsection/uknews", "theguardian/mainsection/education", "theguardian/mainsection/society", "theguardian/mainsection/media", "theguardian/guardian-members/guardian-members"),
    collection("Week in Review").printSentAnyTag("theguardian/mainsection/week-in-review"),
    collection("Weather").printSentAnyTag("theguardian/mainsection/weather2")
  )
    .swatch(News)

  def FrontNewsSpecial = specialFront("News Special", News)

  def FrontNewsWorldGuardian = front(
    "World",
    collection("World News").printSentAnyTag("theguardian/mainsection/international"),
    collection("World Special").special
  )
    .swatch(News)

  def FrontNewsUkObserver = front(
    "National",
    collection("Front Page"),
    collection("UK News").printSentAnyTag("theobserver/news/uknews"),
    collection("Focus").printSentAnyTag("theobserver/news/focus").special,
    collection("News Special").special,
  )
    .swatch(News)

  def FrontNewsWorldObserver = front(
    "World",
    collection("World News").printSentAnyTag("theobserver/news/worldnews"),
    collection("World Special").special,
  )
    .swatch(News)

  def FrontWorldSpecial = specialFront("World Special", News)

  // Financial fronts then special

  def FrontFinancialGuardian = front(
    "Financial",
    collection("Financial").printSentAnyTag("theguardian/mainsection/financial3", "theguardian/mainsection/money"),
    collection("Financial Special").special,
  )
    .swatch(News)

  def FrontFinancialObserver = front(
    "Financial",
    collection("Financial").printSentAnyTag("theobserver/news/business", "theobserver/news/cash"),
    collection("Financial Special").special,
  )
    .swatch(News)

  def FrontFinancialSpecial = specialFront("Financial Special", News)

  def FrontJournal = front(
    "Journal",
    collection("Features").printSentAnyTag("theguardian/journal/the-long-read", "theguardian/journal/features"),
    collection("Comment").printSentAnyTag("theguardian/journal/opinion"),
    collection("Letters").printSentAnyTag("theguardian/journal/letters"),
    collection("Obituaries").printSentAnyTag("theguardian/journal/obituaries"),
    collection("Journal Special").special,
  )
    .swatch(Opinion)

  def FrontComment = front(
    "Journal",
    collection("Comment").printSentAnyTag("theobserver/news/comment"),
    collection("Comment 1"),
    collection("Comment 2"),
    collection("Comment Special").special,
  )
    .swatch(Opinion)

  def FrontOpinionSpecial = specialFront("Journal Special", Opinion)

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
    collection("Culture Special").special,
  )
    .swatch(Culture)

  def FrontBooks = front(
    "Books",
    collection("Books").printSentAnyTag("theguardian/guardianreview/saturdayreviewsfeatres", "theobserver/new-review/books"),
    collection("Books Special").special,
  )
    .swatch(Culture)

  def FrontCultureSpecial = specialFront("Culture Special", Culture)

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
    .special
    .swatch(Lifestyle)

  def FrontLifeWeekend = front(
    "Life",
    collection("Weekend").printSentAnyTag("theguardian/weekend/starters", "theguardian/weekend/features2", "theguardian/weekend/back"),
    collection("Family").printSentAnyTag("theguardian/weekend/family"),
    collection("Space").printSentAnyTag("theguardian/weekend/space2"),
    collection("Fashion & Beauty").printSentAnyTag("theguardian/weekend/fashion-and-beauty"),
    collection("Body & Mind").printSentAnyTag("theguardian/weekend/body-and-mind"),
    collection("Life Special").special,
  )
    .swatch(Lifestyle)

  def FrontTravelGuardian = front(
    "Travel",
    collection("Travel").printSentAnyTag("theguardian/travel/travel"),
    collection("Travel Special").special,
  )
    .swatch(Lifestyle);

  def FrontLifeMagazineObserver = front(
    "Life",
    collection("Features").printSentAnyTag("theobserver/magazine/features2"),
    collection("Life & Style").printSentAllTags("theobserver/magazine/life-and-style", "-food/food"),
    collection("Life Special").printSentAnyTag("theobserver/design/design").special,
  )
    .swatch(Lifestyle)

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

  def FrontLifeSpecial = specialFront("Life Special", Lifestyle)

  def FrontSportGuardian = front(
    "Sport",
    collection("Sport").printSentAnyTag("theguardian/sport/news"),
    collection("Sport 1"),
    collection("Sport 2"),
    collection("Sport 3"),
    collection("Sport Special").special,
  )
    .swatch(Sport)

  def FrontSportObserver = front(
    "Sport",
    collection("Sport").printSentAnyTag("theobserver/sport/news"),
    collection("Sport 1"),
    collection("Sport 2"),
    collection("Sport 3"),
    collection("Sport Special").special,
  )
    .swatch(Sport)

  def FrontSportSpecial = specialFront("Sport Special", Sport)

  def FrontSupplementSpecial1 = specialFront(
    "Special Supplement 1",
    swatch = Neutral,
    prefill = Some(CapiPrefillQuery("?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement", PathType.PrintSent))
  )

  def FrontSupplementSpecial2 = specialFront("Special Supplement 2", Neutral)

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword")
  )
}
