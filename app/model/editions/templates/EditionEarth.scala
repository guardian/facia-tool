package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionEarth extends SpecialEdition {
  override val title = "Edition Earth"
  override val subTitle = "A special, one-off Guardian digital supplement devoted to the environment"
  override val edition = "edition-earth"
  override val header = Header(title ="Edition", subTitle=Some("Earth"))
  override val notificationUTCOffset = 3
  override val topic = "e-e"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/23e97e00b2b0c3277ea6ff8a38068709509d92da/0_0_931_934/931.png?width=120&quality=90&s=9f1e7ebe4b62e4cc5a7ffad05e92306c")
  override val expiry: Option[String] = Some(
    new DateTime(2020, 11,7,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#ededed",
      title = EditionTextFormatting(color = "#121212", font="GHGuardianHeadline-Regular", lineHeight = 34, size = 34),
      subTitle = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Bold", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(87,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#7D0068",
      textColorPrimary = "#FFFFFF",
      textColorSecondary = "#FFFFFF"
    )
  )


  lazy val template = EditionTemplate(
    List(
      Special01 -> Daily(),
      Special02 -> Daily(),
      Special03 -> Daily(),
      Special04 -> Daily(),
      Special05 -> Daily(),
      Special06 -> Daily(),
      Special07 -> Daily(),
      Special08 -> Daily(),
      Special09 -> Daily(),
      Special10 -> Daily(),
      Special11 -> Daily(),
      Special12 -> Daily(),
      Special13 -> Daily(),
      Special14 -> Daily(),
      Special15 -> Daily()
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
  def Special01 = front("Special01", None,
    collection("Special01"),
    collection("Special01"),
    collection("Special01"),
    collection("Special01"),
    collection("Special01")
  ).swatch(Neutral)

  // Climate/global heating (lifestyle/dark #7D0068)
  def Special02 = front("Special02", None,
    collection("Special02"),
    collection("Special02"),
    collection("Special02"),
    collection("Special02"),
    collection("Special02")
  ).swatch(Lifestyle)

  // Emissions/renewables (lifestyle/dark #7D0068)
  def Special03 = front("Special03", None,
    collection("Special03"),
    collection("Special03"),
    collection("Special03"),
    collection("Special03"),
    collection("Special03")
  ).swatch(Lifestyle)

  // Covid 19 (lifestyle/main #BB3B80)
  def Special04 = front("Special04", None,
    collection("Special04"),
    collection("Special04"),
    collection("Special04"),
    collection("Special04"),
    collection("Special04")
  ).swatch(News)

  // Enviromental justice (lifestyle/main #BB3B80)
  def Special05 = front("Special05", None,
    collection("Special05"),
    collection("Special05"),
    collection("Special05"),
    collection("Special05"),
    collection("Special05")
  ).swatch(Lifestyle)

  // Wildlife (sport/dark #005689)
  def Special06 = front("Special06", None,
    collection("Special06"),
    collection("Special06"),
    collection("Special06"),
    collection("Special06"),
    collection("Special06")
  ).swatch(Sport)

  // Bushfires (sport/dark #005689)
  def Special07 = front("Special07", None,
    collection("Special07"),
    collection("Special07"),
    collection("Special07"),
    collection("Special07"),
    collection("Special07")
  ).swatch(Sport)

  // The upside (sport/main #0084C6)
  def Special08 = front("Special08", None,
    collection("Special08"),
    collection("Special08"),
    collection("Special08"),
    collection("Special08"),
    collection("Special08")
  ).swatch(Sport)

  // Advice and guides (brightness.7 #121212)
  def Special09 = front("Special09", None,
    collection("Special09"),
    collection("Special09"),
    collection("Special09"),
    collection("Special09"),
    collection("Special09")
  ).swatch(Neutral)

  def Special10 = front("Special10", None,
    collection("Special10"),
    collection("Special10"),
    collection("Special10"),
    collection("Special10"),
    collection("Special10")
  ).swatch(News)

  def Special11 = front("Special11", None,
    collection("Special11"),
    collection("Special11"),
    collection("Special11"),
    collection("Special11"),
    collection("Special11")
  ).swatch(News)

  def Special12 = front("Special12", None,
    collection("Special12"),
    collection("Special12"),
    collection("Special12"),
    collection("Special12"),
    collection("Special12")
  ).swatch(News)

  def Special13 = front("Special13", None,
    collection("Special13"),
    collection("Special13"),
    collection("Special13"),
    collection("Special13"),
    collection("Special13")
  ).swatch(News)

  def Special14 = front("Special14", None,
    collection("Special14"),
    collection("Special14"),
    collection("Special14"),
    collection("Special14"),
    collection("Special14")
  ).swatch(News)

  def Special15 = front("Special15", None,
    collection("Special15"),
    collection("Special15"),
    collection("Special15"),
    collection("Special15"),
    collection("Special15")
  ).swatch(News)

}
