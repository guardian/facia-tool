package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EarthEdition extends SpecialEdition {
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
      textColorSecondary = "#FFFFFF "
    )
  )


  lazy val template = EditionTemplate(
    List(
      Front1 -> Daily(),
      Front2 -> Daily(),
      Front3 -> Daily()
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

  def Front1 = front("Front 1", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(News)

  def Front2 = front("Front 2", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(Culture)

  def Front3 = front("Front 3", None,
    collection("Collection 1"),
    collection("Collection 2"),
    collection("Collection 3")
  ).swatch(Sport)

}
