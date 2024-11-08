package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionOlympicLegends extends SpecialEdition {
  override val title = "Olympic\nlegends"
  override val subTitle =
    "To mark the 32nd Olympiad, our summer of sport special edition looks at 30 of the greatest Olympic moments"
  override val edition = "edition-olympic-legends"
  override val header = Header(title = "Olympic", subTitle = Some("legends"))
  override val notificationUTCOffset = 3
  override val topic = "e-es"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/88b364af00d13f1a13a3111656dd4c5a7d91ea66/0_0_250_500/250.png?width=80&quality=85&s=6a3ad4ccd98f3bc28f46caa96fa7af87"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2021, 9, 23, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#6B6F51",
      title = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GHGuardianHeadline-Medium",
        lineHeight = 34,
        size = 32
      ),
      subTitle = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GuardianTextSans-Regular",
        lineHeight = 20,
        size = 17
      ),
      expiry = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GuardianTextSans-Regular",
        lineHeight = 16,
        size = 15
      ),
      image = EditionImageStyle(80, 160)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#AB0613",
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
      Special15 -> Daily(),
      Special16 -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = None
  )

  def Special01 = front(
    "Front1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special02 = front(
    "Front2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special03 = front(
    "Front3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special04 = front(
    "Front4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special05 = front(
    "Front5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special06 = front(
    "Front6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special07 = front(
    "Front7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special08 = front(
    "Front8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special09 = front(
    "Front9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special10 = front(
    "Front10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special11 = front(
    "Front11",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special12 = front(
    "Front12",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special13 = front(
    "Front13",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special14 = front(
    "Front14",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special15 = front(
    "Front15",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special16 = front(
    "Front16",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

}
