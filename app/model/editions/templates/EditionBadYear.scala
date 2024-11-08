package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionBadYear extends SpecialEdition {
  override val title = "The best of\na bad year"
  override val subTitle =
    "A special, one-off Guardian digital supplement for the year we'd rather forget"
  override val edition = "edition-bad-year"
  override val header =
    Header(title = "The best of", subTitle = Some("a bad year"))
  override val notificationUTCOffset = 3
  override val topic = "e-by"
  override val buttonImageUri = Some(
    "https://i.guim.co.uk/img/media/9183f03557872759bde51b1ffa52e7952a45cb20/0_0_525_1050/250.png?width=134&quality=100&s=34d3e831560a25f5b7abb164187ab53f"
  )
  override val expiry: Option[String] = Some(
    new DateTime(2021, 1, 23, 23, 59, DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#6B5840",
      title = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GHGuardianHeadline-Light",
        lineHeight = 34,
        size = 34
      ),
      subTitle = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GuardianTextSans-Bold",
        lineHeight = 20,
        size = 17
      ),
      expiry = EditionTextFormatting(
        color = "#FFFFFF",
        font = "GuardianTextSans-Regular",
        lineHeight = 16,
        size = 15
      ),
      image = EditionImageStyle(67, 134)
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
      Special36 -> Daily(),
      Special37 -> Daily(),
      Special38 -> Daily(),
      Special39 -> Daily(),
      Special40 -> Daily()
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
    "Sp Black 1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special02 = front(
    "Sp Black 2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special03 = front(
    "Sp Black 3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special04 = front(
    "Sp Black 4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special05 = front(
    "Sp Black 5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special06 = front(
    "Sp Red 1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special07 = front(
    "Sp Red 2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special08 = front(
    "Sp Red 3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special09 = front(
    "Sp Red 4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special10 = front(
    "Sp Red 5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special11 = front(
    "Sp Red 6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special12 = front(
    "Sp Red 7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special13 = front(
    "Sp Red 8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special14 = front(
    "Sp Red 9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special15 = front(
    "Sp Red 10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(News)

  def Special16 = front(
    "Sp Pink 1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special17 = front(
    "Sp Pink 2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special18 = front(
    "Sp Pink 3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special19 = front(
    "Sp Pink 4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special20 = front(
    "Sp Pink 5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special21 = front(
    "Sp Pink 6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special22 = front(
    "Sp Pink 7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special23 = front(
    "Sp Pink 8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special24 = front(
    "Sp Pink 9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special25 = front(
    "Sp Pink 10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special26 = front(
    "Sp Brown 1",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special27 = front(
    "Sp Brown 2",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special28 = front(
    "Sp Brown 3",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special29 = front(
    "Sp Brown 4",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special30 = front(
    "Sp Brown 5",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special31 = front(
    "Sp Brown 6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special32 = front(
    "Sp Brown 7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special33 = front(
    "Sp Brown 8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special34 = front(
    "Sp Brown 9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special35 = front(
    "Sp Brown 10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special36 = front(
    "Sp Black 6",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special37 = front(
    "Sp Black 7",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special38 = front(
    "Sp Black 8",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special39 = front(
    "Sp Black 9",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special40 = front(
    "Sp Black 10",
    None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

}
