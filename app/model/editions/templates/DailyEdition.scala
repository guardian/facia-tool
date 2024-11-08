package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object DailyEdition extends RegionalEdition {
  override val title = "UK Daily"
  override val subTitle = "Published from London every\nmorning by 6am (GMT)"
  override val edition = "daily-edition"
  override val header = Header("UK", Some("Daily"))
  override val notificationUTCOffset = 3
  override val topic = "uk"
  override val locale = Some("en_GB")

  lazy val template = EditionTemplate(
    List(
      // Top Stories and Nuclear specials
      FrontSpecial1 -> Daily(),
      FrontTopStories -> Daily(),
      FrontSpecial2 -> Daily(),
      // News fronts then special
      FrontNewsUkGuardian -> WeekDays(
        List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs, WeekDay.Fri)
      ),
      FrontNewsUkGuardianSaturday -> WeekDays(List(WeekDay.Sat)),
      FrontNewsUkObserver -> WeekDays(List(WeekDay.Sun)),
      FrontNewsSpecial -> Daily(),
      // World News fronts and special
      FrontNewsWorldGuardian -> WeekDays(
        List(
          WeekDay.Mon,
          WeekDay.Tues,
          WeekDay.Wed,
          WeekDay.Thurs,
          WeekDay.Fri,
          WeekDay.Sat
        )
      ),
      FrontNewsWorldObserver -> WeekDays(List(WeekDay.Sun)),
      FrontWorldSpecial -> Daily(),
      // Financial fronts and special
      FrontBusinessGuardian -> WeekDays(
        List(
          WeekDay.Mon,
          WeekDay.Tues,
          WeekDay.Wed,
          WeekDay.Thurs,
          WeekDay.Fri,
          WeekDay.Sat
        )
      ),
      FrontBusinessObserver -> WeekDays(List(WeekDay.Sun)),
      // Journal, Comment and special
      FrontJournal -> WeekDays(
        List(
          WeekDay.Mon,
          WeekDay.Tues,
          WeekDay.Wed,
          WeekDay.Thurs,
          WeekDay.Fri,
          WeekDay.Sat
        )
      ),
      FrontComment -> WeekDays(List(WeekDay.Sun)),
      FrontOpinionSpecial -> Daily(),
      // Culture fronts and special
      FrontCulture -> WeekDays(
        List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)
      ),
      FrontCultureFilmMusic -> WeekDays(List(WeekDay.Fri)),
      // New for Saturday Magazine
      FrontLifeSaturdayMagazineFeatures -> WeekDays(List(WeekDay.Sat)),
      FrontLifeSaturdayMagazineCuttings -> WeekDays(List(WeekDay.Sat)),
      // New for the Saturday Magazine
      FrontCultureSaturdayMagazineCulture -> WeekDays(List(WeekDay.Sat)),
      // What's on
      FrontCultureSaturdayMagazineWhatsOn -> WeekDays(List(WeekDay.Sat)),
      FrontCultureSaturdayMagazineBooks -> WeekDays(List(WeekDay.Sat)),
      FrontCultureNewReview -> WeekDays(List(WeekDay.Sun)),
      FrontCriticsNewReview -> WeekDays(List(WeekDay.Sun)),
      FrontBooks -> WeekDays(List(WeekDay.Sun)),
      FrontCultureSpecial -> Daily(),
      // Life fronts and special
      FrontLife -> WeekDays(
        List(WeekDay.Mon, WeekDay.Tues, WeekDay.Wed, WeekDay.Thurs)
      ),
      FrontLifeWeekend -> WeekDays(List(WeekDay.Sat)),
      FrontTravelGuardian -> WeekDays(List(WeekDay.Sat)),
      FrontLifeMagazineObserver -> WeekDays(List(WeekDay.Sun)),
      FrontFood -> WeekDays(List(WeekDay.Sat)),
      FrontFoodObserver -> WeekDays(List(WeekDay.Sun)),
      FrontLifeFashion -> WeekDays(List(WeekDay.Sat)),
      FrontLifeDesign -> WeekDays(List(WeekDay.Sun)),
      FrontLifeSpecial -> WeekDays(
        List(
          WeekDay.Mon,
          WeekDay.Tues,
          WeekDay.Wed,
          WeekDay.Thurs,
          WeekDay.Sat,
          WeekDay.Sun
        )
      ),
      // Sport fronts and special
      FrontSportGuardian -> WeekDays(
        List(
          WeekDay.Mon,
          WeekDay.Tues,
          WeekDay.Wed,
          WeekDay.Thurs,
          WeekDay.Fri,
          WeekDay.Sat
        )
      ),
      FrontSportObserver -> WeekDays(List(WeekDay.Sun)),
      FrontSportSpecial -> Daily(),
      // Special Supplements
      FrontSupplementSpecial1 -> Daily(),
      FrontSupplementSpecial2 -> Daily(),
      // Crosswords
      FrontCrosswords -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.NewspaperEdition,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = None
  )

  def FrontSpecial1 = specialFront("Top Special 1", Neutral, None)

  def FrontTopStories = front(
    "Top stories",
    collection("Top stories")
  )

  def FrontSpecial2 = specialFront("Top Special 2", Neutral, None)

  def FrontNewsUkGuardian = front(
    "National",
    collection("National").printSentAnyTag(
      "theguardian/mainsection/topstories"
    ),
    collection("National").hide,
    collection("National").printSentAnyTag(
      "theguardian/mainsection/uknews",
      "theguardian/mainsection/education",
      "theguardian/mainsection/society",
      "theguardian/mainsection/media",
      "theguardian/guardian-members/guardian-members"
    ),
    collection("National").printSentAnyTag("theguardian/mainsection/weather2"),
    collection("National").hide,
    collection("National").hide
  )
    .swatch(News)

  def FrontNewsUkGuardianSaturday = front(
    "National",
    collection("National").printSentAnyTag(
      "theguardian/mainsection/topstories"
    ),
    collection("National").hide,
    collection("National").printSentAnyTag(
      "theguardian/mainsection/uknews",
      "theguardian/mainsection/education",
      "theguardian/mainsection/society",
      "theguardian/mainsection/media",
      "theguardian/guardian-members/guardian-members",
      "theguardian/mainsection/environmentnews"
    ),
    collection("Week in Review").printSentAnyTag(
      "theguardian/mainsection/week-in-review"
    ),
    collection("National").printSentAnyTag("theguardian/mainsection/weather2"),
    collection("National").hide,
    collection("National").hide
  )
    .swatch(News)

  def FrontNewsSpecial = specialFront("News Special", News).swatch(News)

  def FrontNewsWorldGuardian = front(
    "World",
    collection("World").printSentAnyTag(
      "theguardian/mainsection/international"
    ),
    collection("World").hide,
    collection("World").hide,
    collection("World").hide,
    collection("World").hide,
    collection("World").hide
  )
    .swatch(News)

  def FrontNewsUkObserver = front(
    "National",
    collection("National"),
    collection("National").printSentAnyTag("theobserver/news/uknews"),
    collection("National").hide,
    collection("National").hide,
    collection("National").hide,
    collection("National").hide,
    collection("National").hide
  )
    .swatch(News)

  def FrontNewsWorldObserver = front(
    "World",
    collection("World").printSentAnyTag("theobserver/news/worldnews"),
    collection("World").hide,
    collection("World").hide,
    collection("World").hide,
    collection("World").hide,
    collection("World").hide
  )
    .swatch(News)

  def FrontWorldSpecial = specialFront("World Special", News)

  // Financial fronts then special

  def FrontBusinessGuardian = front(
    "Business",
    collection("Business").printSentAnyTag(
      "theguardian/mainsection/financial3"
    ),
    collection("Business"),
    collection("Money").printSentAnyTag("theguardian/mainsection/money"),
    collection("Money")
  )
    .swatch(News)

  def FrontBusinessObserver = front(
    "Business",
    collection("Business").printSentAnyTag("theobserver/news/business"),
    collection("Business"),
    collection("Money").printSentAnyTag("theobserver/news/cash"),
    collection("Money")
  )
    .swatch(News)

  def FrontFinancialSpecial = specialFront("Financial Special", News, None)

  def FrontJournal = front(
    "Journal",
    collection("Features").printSentAnyTag(
      "theguardian/journal/the-long-read",
      "theguardian/journal/features"
    ),
    collection("Comment").printSentAnyTag("theguardian/journal/opinion"),
    collection("Comment").hide,
    collection("Letters").printSentAnyTag("theguardian/journal/letters"),
    collection("Journal"),
    collection("Obituaries").printSentAnyTag("theguardian/journal/obituaries"),
    collection("Journal").hide
  )
    .swatch(Opinion)

  def FrontComment = front(
    "Journal",
    collection("Comment").printSentAnyTag("theobserver/news/comment"),
    collection("Focus").printSentAnyTag("theobserver/news/focus"),
    collection("Journal"),
    collection("Journal"),
    collection("Journal").hide
  )
    .swatch(Opinion)

  def FrontOpinionSpecial = specialFront("Journal Special", Opinion)

  // New for Saturday Life Magazine, we're making temporarily a special to be hidden by default.

  def FrontLifeSaturdayMagazineFeatures = front(
    "Features",
    collection("Features").printSentAnyTag("theguardian/saturday/features"),
    collection("Features"),
    collection("Features"),
    collection("Features"),
    collection("Features").hide
  )
    .swatch(Lifestyle)

  def FrontLifeSaturdayMagazineCuttings = front(
    "Cuttings",
    collection("Cuttings").printSentAnyTag("theguardian/saturday/cuttings"),
    collection("Cuttings"),
    collection("Cuttings"),
    collection("Cuttings"),
    collection("Cuttings").hide
  )
    .swatch(Lifestyle)

  def FrontCulture = front(
    "Culture",
    collection("Arts").printSentAnyTag("theguardian/g2/arts"),
    collection("Culture").hide,
    collection("TV & radio").printSentAnyTag("theguardian/g2/tvandradio"),
    collection("Culture").hide
  )
    .swatch(Culture)

  def FrontCultureSaturdayMagazineWhatsOn = front(
    "What's on",
    collection("What's on").printSentAnyTag("theguardian/whatson/whatson"),
    collection("What's on"),
    collection("What's on"),
    collection("What's on"),
    collection("What's on").hide
  )
    .swatch(Culture)

  def FrontCultureFilmMusic = front(
    "Culture",
    collection("Film").printSentAnyTag("theguardian/g2/film"),
    collection("Music").printSentAnyTag("theguardian/g2/music"),
    collection("Arts").printSentAnyTag("theguardian/g2/arts"),
    collection("TV & radio").printSentAnyTag("theguardian/g2/tvandradio"),
    collection("Culture"),
    collection("Culture").hide,
    collection("Culture").hide,
    collection("Culture").hide
  )
    .swatch(Culture)

  // New for the Saturday Magazine

  def FrontCultureSaturdayMagazineCulture = front(
    "Culture",
    collection("Culture").printSentAnyTag(
      "theguardian/saturday/culture",
      "theguardian/whatson/whatson"
    ),
    collection("Culture"),
    collection("Culture"),
    collection("Culture"),
    collection("Culture").hide
  )
    .swatch(Culture)

  def FrontCultureSaturdayMagazineBooks = front(
    "Books",
    collection("Books"),
    collection("Books"),
    collection("Books"),
    collection("Books"),
    collection("Books").hide
  )
    .swatch(Culture)

  def FrontCultureNewReview = front(
    "Culture",
    collection("Features").printSentAnyTag("theobserver/new-review/features"),
    collection("Agenda").printSentAnyTag("theobserver/new-review/agenda"),
    collection("Discover").printSentAnyTag("theobserver/new-review/discover"),
    collection("Critics"),
    collection("Culture").hide,
    collection("Culture").hide,
    collection("Culture").hide
  )
    .swatch(Culture)

  def FrontCriticsNewReview = front(
    "Critics",
    collection("Critics").printSentAnyTag("theobserver/new-review/critics"),
    collection("Critics"),
    collection("Critics"),
    collection("Critics"),
    collection("Critics").hide,
    collection("Critics").hide,
    collection("Critics").hide
  )
    .swatch(Culture)

  def FrontBooks = front(
    "Books",
    collection("Books").printSentAnyTag("theobserver/new-review/books"),
    collection("Books").hide,
    collection("Books").hide,
    collection("Books").hide,
    collection("Books").hide
  )
    .swatch(Culture)

  def FrontCultureSpecial = specialFront("Culture Special", Culture)

  def FrontLife = front(
    "Life",
    collection("Features").printSentAnyTag("theguardian/g2/features"),
    collection("Life").hide,
    collection("Life").hide
  )
    .swatch(Lifestyle)

  // Hidden by default, a front for the irregular 'The Fashion' supplement

  def FrontLifeFashion = front(
    "The Fashion",
    collection("The Fashion").printSentAnyTag(
      "theguardian/the-fashion/the-fashion"
    ),
    collection("The Fashion").hide,
    collection("The Fashion").hide,
    collection("The Fashion").hide,
    collection("The Fashion").hide,
    collection("The Fashion").hide
  ).special
    .swatch(Lifestyle)

  // Hidden by default, a front for the irregular 'Design' supplement

  def FrontLifeDesign = front(
    "Design",
    collection("Design").printSentAnyTag("theobserver/design/design"),
    collection("Design").hide,
    collection("Design").hide,
    collection("Design").hide,
    collection("Design").hide,
    collection("Design").hide
  ).special
    .swatch(Lifestyle)

  def FrontLifeWeekend = front(
    "Life",
    collection("Life").printSentAnyTag("theguardian/saturday/lifestyle"),
    collection("Life"),
    collection("Style"),
    collection("Space"),
    collection("Life"),
    collection("Life").hide,
    collection("Life").hide
  )
    .swatch(Lifestyle)

  def FrontTravelGuardian = front(
    "Travel",
    collection("Travel").printSentAnyTag("theguardian/travel/travel"),
    collection("Travel").hide,
    collection("Travel").hide
  )
    .swatch(Lifestyle)

  def FrontLifeMagazineObserver = front(
    "Life",
    collection("Features").printSentAnyTag("theobserver/magazine/features2"),
    collection("Life")
      .printSentAllTags("theobserver/magazine/life-and-style", "-food/food"),
    collection("Life").printSentAnyTag("theobserver/design/design").hide,
    collection("Life").hide,
    collection("Life").hide,
    collection("Life").hide,
    collection("Life").hide
  )
    .swatch(Lifestyle)

  def FrontFood = front(
    "Food",
    collection("Food").printSentAnyTag("theguardian/feast/feast"),
    collection("Food").hide,
    collection("Food").hide,
    collection("Food").hide,
    collection("Food").hide,
    collection("Food").hide
  )
    .swatch(Lifestyle)

  def FrontFoodObserver = front(
    "Food",
    collection("Food")
      .printSentAllTags("theobserver/magazine/life-and-style", "food/food"),
    collection("Monthly")
      .printSentAnyTag(
        "theobserver/foodmonthly/features",
        "theobserver/foodmonthly"
      )
      .hide,
    collection("Food").hide,
    collection("Food").hide,
    collection("Food").hide
  )
    .swatch(Lifestyle)

  def FrontLifeSpecial = specialFront("Life Special", Lifestyle)

  def FrontSportGuardian = front(
    "Sport",
    collection("Sport").printSentAnyTag("theguardian/sport/news"),
    collection("Sport"),
    collection("Sport"),
    collection("Sport"),
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide
  )
    .swatch(Sport)

  def FrontSportObserver = front(
    "Sport",
    collection("Sport").printSentAnyTag("theobserver/sport/news"),
    collection("Sport"),
    collection("Sport"),
    collection("Sport"),
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide,
    collection("Sport").hide
  )
    .swatch(Sport)

  def FrontSportSpecial = specialFront("Sport Special", Sport)

  def FrontSupplementSpecial1 = specialFront(
    "Supplement",
    swatch = Neutral,
    prefill = Some(
      CapiPrefillQuery(
        "?tag=theguardian/special-supplement/special-supplement|theobserver/special-supplement/special-supplement",
        PathType.PrintSent
      )
    )
  )

  def FrontSupplementSpecial2 = specialFront("Special Supplement", Neutral)

  def FrontCrosswords = front(
    "Crosswords",
    collection("Crosswords").searchPrefill("?tag=type/crossword")
  )

}
