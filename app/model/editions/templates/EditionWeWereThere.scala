package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionWeWereThere extends SpecialEdition {
  override val title = "The books\nof 2021"
  override val subTitle = "A special edition of the Guardian on the books we think you should read this year"
  override val edition = "edition-we-were-there"
  override val header = Header(title ="The books", subTitle=Some("of 2021"))
  override val notificationUTCOffset = 3
  override val topic = "e-bk"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/e57e787606c4018a1f6d2e1cd3537246acde815e/0_0_250_500/250.png?width=80&quality=85&s=ccb203cdd28a0921c98e5c226b7892fb")
  override val expiry: Option[String] = Some(
    new DateTime(2021, 5,10,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#6B5840",
      title = EditionTextFormatting(color = "#FFFFFF", font="GHGuardianHeadline-Medium", lineHeight = 34, size = 32),
      subTitle = EditionTextFormatting(color = "#FFFFFF", font="GuardianTextSans-Regular", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#FFFFFF", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(80,160)
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
      Special13 -> Daily()
      
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

  def Special01 = front("Sp Neutral 1", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special02 = front("Sp Culture 2", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special03 = front("Sp Opinion 3", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special04 = front("Sp Lifestyle 4", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)
  
  def Special05 = front("Sp Neutral 5", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special06 = front("Sp Culture 6", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special07 = front("Sp Opinion 7", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special08 = front("Sp Lifestyle 8", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)
  
  def Special09 = front("Sp Neutral 9", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

  def Special10 = front("Sp Culture 10", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Culture)

  def Special11 = front("Sp Opinion 11", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special12 = front("Sp Lifestyle 12", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Lifestyle)
  
  def Special13 = front("Sp Neutral 13", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Neutral)

}
