package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionOlympicLegends extends SpecialEdition {
  override val title = "Edition\nEarth"
  override val subTitle = "A special edition of the Guardian's best environmental journalism in the run up to the COP26 Glasgow summit"
  override val edition = "edition-earth-2021"
  override val header = Header(title ="Edition", subTitle=Some("Earth"))
  override val notificationUTCOffset = 3
  override val topic = "e-es"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/88b364af00d13f1a13a3111656dd4c5a7d91ea66/0_0_250_500/250.png?width=80&quality=85&s=6a3ad4ccd98f3bc28f46caa96fa7af87")
  override val expiry: Option[String] = Some(
    new DateTime(2021, 12,12,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#6B6F51",
      title = EditionTextFormatting(color = "#FFFFFF", font="GHGuardianHeadline-Medium", lineHeight = 34, size = 32),
      subTitle = EditionTextFormatting(color = "#FFFFFF", font="GuardianTextSans-Regular", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#FFFFFF", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(80,160)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#076633",
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
      Special10 -> Daily()
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

  def Special01 = front("Introduction", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special02 = front("Science", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special03 = front("Transport", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special04 = front("Health", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)
  
  def Special05 = front("Food", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special06 = front("Fashion", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special07 = front("Sport", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special08 = front("Business", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)
  
  def Special09 = front("Awareness", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)
  
  def Special10 = front("Solutions", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)
  
}
