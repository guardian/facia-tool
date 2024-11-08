package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionWeWereThere extends SpecialEdition {
  override val title = "We were\nthere"
  override val subTitle =
    "Moments that made the Guardian. A special edition with some of our most memorable journalism from 1821-2021"
  override val edition = "edition-we-were-there"
  override val header = Header(title = "We were", subTitle = Some("there"))
  override val notificationUTCOffset = 3
  override val topic = "e-wwt"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/375fb77684125af03b760bae24141f27da3b2f46/0_0_1000_2000/250.png?width=80&quality=85&s=808ddc9a72495aa5f2883be6ad69725d"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2021, 6, 7, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#C70000",
      title = EditionTextFormatting(
        color = "#007ABC",
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
      backgroundColor = "#C70000",
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
  ).swatch(Neutral)

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
  ).swatch(Neutral)

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
  ).swatch(Neutral)

  def Special08 = front(
    "Front8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special09 = front(
    "Front9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special10 = front(
    "Front10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special11 = front(
    "Front11",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special12 = front(
    "Front12",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special13 = front(
    "Front13",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

}
