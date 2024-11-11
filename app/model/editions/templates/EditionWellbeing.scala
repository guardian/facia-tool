package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionWellbeing extends SpecialEdition {
  override val title = "Self and\nwellbeing"
  override val subTitle =
    "This special edition is an exclusive curation of some of our most popular articles around feeling well and improving your life"
  override val edition = "edition-wellbeing"
  override val header = Header(title = "Self", subTitle = Some("and wellbeing"))
  override val notificationUTCOffset = 3
  override val topic = "e-wb"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/d8460a05286b316e6646d2512b2ee0d6ee36dae4/0_0_5000_5000/5000.png?width=163&quality=100&s=4ffd8ae83df7aaf29cf20545e2a88f87"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2022, 6, 9, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#0293E1",
      title = EditionTextFormatting(
        color = "#0077B6",
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
      image = EditionImageStyle(67, 134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#0077B6",
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
      Special13 -> Daily()
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
    "Special01",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special02 = front(
    "Special02",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special03 = front(
    "Special03",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special04 = front(
    "Special04",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special05 = front(
    "Special05",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special06 = front(
    "Special06",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special07 = front(
    "Special07",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special08 = front(
    "Special08",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special09 = front(
    "Special09",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special10 = front(
    "Special10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special11 = front(
    "Special11",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special12 = front(
    "Special12",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special13 = front(
    "Special13",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

}
