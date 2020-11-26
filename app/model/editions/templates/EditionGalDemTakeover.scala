package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionGalDemTakeover extends SpecialEdition {
  override val title = "Gal-dem takeover"
  override val subTitle = "A special edition committed to sharing perspectives from women and non-binary people of colour"
  override val edition = "edition-gal-dem-takeover"
  override val header = Header(title ="Gal-dem ", subTitle=Some("Takeover"))
  override val notificationUTCOffset = 3
  override val topic = "e-g"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/e844afefe7938c4370f33a402d3dab8bbaf2ee3f/0_0_87_145/87.png?quality=85&s=f557a85a597fe987ce30ac386315ddeb")
  override val expiry: Option[String] = Some(
    new DateTime(2020, 12,31,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#fec8de",
      title = EditionTextFormatting(color = "#7d006b", font="GHGuardianHeadline-Light", lineHeight = 34, size = 34),
      subTitle = EditionTextFormatting(color = "#7d006b", font="GuardianTextSans-Bold", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#7d006b", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(67,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#fec8de",
      textColorPrimary = "#000000",
      textColorSecondary = "#000000"
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
      Special27 -> Daily()
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

  def Special01 = front("Top stories", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special02 = front("Features", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special03 = front("Opinion", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special04 = front("Life", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special05 = front("Beauty", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special06 = front("Sp Orange 2", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special07 = front("Sp Black 3", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special08 = front("Sp Pink 3", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special09 = front("Sp Orange 3", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special10 = front("Sp Black 4", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special11 = front("Sp Pink 4", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special12 = front("Sp Orange 4", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special13 = front("Sp Black 5", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special14 = front("Sp Pink 5", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special15 = front("Sp Orange 5", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special16 = front("Sp Black 6", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special17 = front("Sp Pink 6", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special18 = front("Sp Orange 6", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special19 = front("Sp Black 7", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special20 = front("Sp Pink 7", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special21 = front("Sp Orange 7", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special22 = front("Sp Black 8", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special23 = front("Sp Pink 8", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special24 = front("Sp Orange 8", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special25 = front("Sp Black 9", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special26 = front("Sp Pink 9", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)

  def Special27 = front("Sp Orange 9", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)


}
