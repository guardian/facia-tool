package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionEurosSpecial extends SpecialEdition {
  override val title = "Euros\nspecial"
  override val subTitle =
    "A special edition of the Guardian on the European championships to kick off a great summer of sport"
  override val edition = "edition-euros-special"
  override val header = Header(title = "Euros", subTitle = Some("special"))
  override val notificationUTCOffset = 3
  override val topic = "e-es"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/c2789bcfc339f8a42f8dbfd6384e910a596b2836/0_0_1000_2000/1000.png?width=80&quality=85&s=5b82671dfe610a22e6ccbfc54cba8895"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2021, 7, 11, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#0293E1",
      title = EditionTextFormatting(
        color = "#121212",
        font = "GHGuardianHeadline-Medium",
        lineHeight = 34,
        size = 32
      ),
      subTitle = EditionTextFormatting(
        color = "#121212",
        font = "GuardianTextSans-Regular",
        lineHeight = 20,
        size = 17
      ),
      expiry = EditionTextFormatting(
        color = "#121212",
        font = "GuardianTextSans-Regular",
        lineHeight = 16,
        size = 15
      ),
      image = EditionImageStyle(80, 160)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#007ABC",
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
  ).swatch(Neutral)

  def Special02 = front(
    "Front2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

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
  ).swatch(News)

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
  ).swatch(News)

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
  ).swatch(News)

  def Special09 = front(
    "Front9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

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
  ).swatch(Sport)

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
  ).swatch(Sport)

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
  ).swatch(Sport)

}
