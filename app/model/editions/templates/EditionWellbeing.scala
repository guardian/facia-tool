
package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._
import org.joda.time.{DateTime, DateTimeZone}

//noinspection TypeAnnotation
object EditionWellbeing extends SpecialEdition {
  override val title = "LineOne\nLineTwo"
  override val subTitle = "A look back at our readers’ and editors’ favourite pieces of the year"
  override val edition = "edition-wellbeing"
  override val header = Header(title ="2021", subTitle=Some("Highs, hits, hopes"))
  override val notificationUTCOffset = 3
  override val topic = "e-wb"
  override val buttonImageUri = Some("https://i.guim.co.uk/img/media/04682faa0ac6d5665ce31f4a7c4bf8d8c0a5e54e/0_0_86_163/86.png?width=86&height=163&quality=85&s=a10d08a2df25b72e67bdf61b943f3b82")
  override val expiry: Option[String] = Some(
    new DateTime(2022, 1,31,23,59,DateTimeZone.UTC).toString()
  )
  override val buttonStyle: Option[SpecialEditionButtonStyles] = Some(
    SpecialEditionButtonStyles(
      backgroundColor = "#7D0068",
      title = EditionTextFormatting(color = "#121212", font="GHGuardianHeadline-Medium", lineHeight = 34, size = 32),
      subTitle = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Regular", lineHeight = 20, size = 17),
      expiry = EditionTextFormatting(color = "#121212", font="GuardianTextSans-Regular", lineHeight = 16, size = 15),
      image = EditionImageStyle(67,134)
    )
  )
  override val headerStyle: Option[SpecialEditionHeaderStyles] = Some(
    SpecialEditionHeaderStyles(
      backgroundColor = "#7D0068",
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

  def Special01 = front("Special01", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special02 = front("Special02", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special03 = front("Special03", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special04 = front("Special04", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special05 = front("Special05", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special06 = front("Special06", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special07 = front("Special07", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special08 = front("Special08", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special09 = front("Special09", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special10 = front("Special10", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)

  def Special11 = front("Special11", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

  def Special12 = front("Special12", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Sport)
  
    def Special13 = front("Special13", None,
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special"),
    collection("Special")
  ).swatch(Opinion)

}
