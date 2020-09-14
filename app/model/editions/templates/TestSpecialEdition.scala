package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object TestSpecialEdition extends SpecialEdition {
  override val title = "Special Edition Test"
  override val subTitle = "Demonstration of special edition"
  override val edition = "test-special-edition"
  override val header = Header(title ="Special", subTitle=Some("Edition Test"))
  override val notificationUTCOffset = 3
  override val topic = "s-e-t"
  override val buttonImageUri = Some("https://media.guim.co.uk/efe173f8944226a06d667869c7f19d072f6807df/541_232_1740_2680/1740.jpg")
  override val expiry: Option[String] = Some(
    new DateTime(2020, 10,20,12,0,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "",
      title = EditionTextFormatting(color = "#c1de2b", font="GHGuardianHeadline-Regular", lineHeight = 34, size = 34),
      subTitle = EditionTextFormatting(color = "#284b7d", font="GuardianTextSans-Bold", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#5a287d", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(87,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#de2b67",
      textColorPrimary = "#de482b",
      textColorSecondary = "#dea22b"
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
