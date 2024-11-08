package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionBooks extends SpecialEdition {
  override val title = "The books\nof 2021"
  override val subTitle =
    "A special edition of the Guardian on the books we think you should read this year"
  override val edition = "edition-books"
  override val header = Header(title = "The books", subTitle = Some("of 2021"))
  override val notificationUTCOffset = 3
  override val topic = "e-bk"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/e57e787606c4018a1f6d2e1cd3537246acde815e/0_0_250_500/250.png?width=80&quality=85&s=ccb203cdd28a0921c98e5c226b7892fb"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2021, 5, 10, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#6B5840",
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
      backgroundColor = "#6B5840",
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
      Special16 -> Daily(),
      Special17 -> Daily(),
      Special18 -> Daily(),
      Special19 -> Daily(),
      Special20 -> Daily(),
      Special21 -> Daily(),
      Special22 -> Daily(),
      Special23 -> Daily(),
      Special24 -> Daily(),
      Special25 -> Daily(),
      Special26 -> Daily(),
      Special27 -> Daily(),
      Special28 -> Daily(),
      Special29 -> Daily(),
      Special30 -> Daily(),
      Special31 -> Daily(),
      Special32 -> Daily(),
      Special33 -> Daily(),
      Special34 -> Daily(),
      Special35 -> Daily(),
      Special36 -> Daily()
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
    "Sp Neutral 1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special02 = front(
    "Sp Culture 2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special03 = front(
    "Sp Opinion 3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special04 = front(
    "Sp Lifestyle 4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special05 = front(
    "Sp Neutral 5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special06 = front(
    "Sp Culture 6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special07 = front(
    "Sp Opinion 7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special08 = front(
    "Sp Lifestyle 8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special09 = front(
    "Sp Neutral 9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special10 = front(
    "Sp Culture 10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special11 = front(
    "Sp Opinion 11",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special12 = front(
    "Sp Lifestyle 12",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special13 = front(
    "Sp Neutral 13",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special14 = front(
    "Sp Culture 14",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special15 = front(
    "Sp Opinion 15",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special16 = front(
    "Sp Lifestyle 16",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special17 = front(
    "Sp Neutral 17",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special18 = front(
    "Sp Culture 18",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special19 = front(
    "Sp Opinion 19",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special20 = front(
    "Sp Lifestyle 20",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special21 = front(
    "Sp Neutral 21",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special22 = front(
    "Sp Culture 22",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special23 = front(
    "Sp Opinion 23",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special24 = front(
    "Sp Lifestyle 24",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special25 = front(
    "Sp Neutral 25",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special26 = front(
    "Sp Culture 26",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special27 = front(
    "Sp Opinion 27",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special28 = front(
    "Sp Lifestyle 28",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special29 = front(
    "Sp Neutral 29",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special30 = front(
    "Sp Culture 30",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special31 = front(
    "Sp Opinion 31",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special32 = front(
    "Sp Lifestyle 32",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special33 = front(
    "Sp Neutral 33",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special34 = front(
    "Sp Culture 34",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special35 = front(
    "Sp Opinion 35",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special36 = front(
    "Sp Lifestyle 36",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

}
