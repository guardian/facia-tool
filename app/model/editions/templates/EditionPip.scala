package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionPip extends SpecialEdition {
  override val title = "Pip's Edition"
  override val subTitle = "The best things in The Guardian"
  override val edition = "edition-pip"
  override val header = Header(title ="Edition", subTitle=Some("Pip"))
  override val notificationUTCOffset = 3
  override val topic = "p-e"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/8aa1cc4809e22e7de004bf578f65fb6fa62890cd/257_65_209_209/209.png?width=134&quality=100&s=4d9c2e7e416fbfe121838d12c5566a80")
  override val expiry: Option[String] = Some(
    new DateTime(2020, 10 ,7,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#ededed",
      title = EditionTextFormatting(color = "#121212", font="GHGuardianHeadline-Light", lineHeight = 34, size = 34),
      subTitle = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Bold", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(134,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#3B6B23",
      textColorPrimary = "#FFFFFF",
      textColorSecondary = "#FFFFFF"
    )
  )


  lazy val template = EditionTemplate(
    List(
      animals -> Daily(),
      pubs -> Daily(),
      glastonbury -> Daily(),
      heroes -> Daily(),

    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0,
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = None
  )

  // Intro (brightness.7 #121212)
  def animals = front("Animals", None,
    collection("Squirrel"),
    collection("Cats").
      searchPrefill("?tag=lifeandstyle/cats")
      .withArticleItemsCap(5),
    collection("Penguins")
      .searchPrefill("?tag=profile/jeremy-corbyn")
      .withArticleItemsCap(5),
    collection("Elephants")
      .searchPrefill("?tag=film/elephant")
      .withArticleItemsCap(5)
  ).swatch(Neutral)

  // Climate/global heating (lifestyle/dark #7D0068)
  def pubs = front("Pubs", None,
    collection("Beer")
      .searchPrefill("?tag=lifeandstyle/pubs")
      .withArticleItemsCap(5),
    collection("Sunshine")
      .searchPrefill("?tag=lifeandstyle/gardens")
      .withArticleItemsCap(5),
  ).swatch(Lifestyle)

  // Emissions/renewables (lifestyle/dark #7D0068)
  def glastonbury = front("Glastonbury", None,
    collection("Sunny days")
      .searchPrefill("?tag=music/glastonbury")
      .withArticleItemsCap(20),
  ).swatch(Opinion)

  // Covid 19 (lifestyle/main #BB3B80)
  def heroes = front("Ohh", None,
    collection("Jeremy Corbynn")
      .searchPrefill("?tag=profile/jeremy-corbyn")
      .withArticleItemsCap(5),
    collection("Chris Riddell")
      .searchPrefill("?tag=profile/chris-riddell")
      .withArticleItemsCap(5),
    collection("McDonDonDonell")
      .searchPrefill("?tag=profile/johnmcdonnell")
      .withArticleItemsCap(5),
    collection("Owen Joness")
      .searchPrefill("?tag=profile/owen-jones")
      .withArticleItemsCap(5),
    collection("George Monbiott")
      .searchPrefill("?tag=profile/georgemonbiot")
      .withArticleItemsCap(5)
  ).swatch(News)



}
