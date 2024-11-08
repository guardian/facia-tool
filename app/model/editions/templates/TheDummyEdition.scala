package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TheDummyEdition extends InternalEdition {
  override val title = "The Dummy Edition"
  override val subTitle = "Internal usage only, for reproducing issues"
  override val edition = "the-dummy-edition"
  override val header = Header("The Dummy", Some("Edition"))
  override val notificationUTCOffset = 3
  override val topic = "dm"
  override val locale = Some("en_GB")

  lazy val template = EditionTemplate(
    List(
      FrontSpecial01 -> Daily(),
      FrontSpecial02 -> Daily(),
      FrontSpecial03 -> Daily(),
      FrontSpecial04 -> Daily(),
      FrontSpecial05 -> Daily(),
      FrontSpecial06 -> Daily(),
      FrontSpecial07 -> Daily(),
      FrontSpecial08 -> Daily(),
      FrontSpecial09 -> Daily(),
      FrontSpecial10 -> Daily(),
      FrontSpecial11 -> Daily(),
      FrontSpecial12 -> Daily(),
      FrontSpecial13 -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -365,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = Some(
      OphanQueryPrefillParams(
        apiKey = s"fronts-editions-${this.getClass.toString}",
        timeWindowConfig = TimeWindowConfigInDays(
          startOffset = -365,
          endOffset = 0
        )
      )
    )
  )

  def FrontSpecial01 = front(
    "Front Special 1",
    collection("1 Special 1").hide,
    collection("1 Special 2").hide,
    collection("1 Special 3").hide,
    collection("1 Special 4").hide,
    collection("1 Special 5").hide,
    collection("1 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial02 = front(
    "Front Special 2",
    collection("2 Special 1").hide,
    collection("2 Special 2").hide,
    collection("2 Special 3").hide,
    collection("2 Special 4").hide,
    collection("2 Special 5").hide,
    collection("2 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial03 = front(
    "Front Special 3",
    collection("3 Special 1").hide,
    collection("3 Special 2").hide,
    collection("3 Special 3").hide,
    collection("3 Special 4").hide,
    collection("3 Special 5").hide,
    collection("3 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial04 = front(
    "Front Special 4",
    collection("4 Special 1").hide,
    collection("4 Special 2").hide,
    collection("4 Special 3").hide,
    collection("4 Special 4").hide,
    collection("4 Special 5").hide,
    collection("4 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial05 = front(
    "Front Special 5",
    collection("5 Special 1").hide,
    collection("5 Special 2").hide,
    collection("5 Special 3").hide,
    collection("5 Special 4").hide,
    collection("5 Special 5").hide,
    collection("5 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial06 = front(
    "Front Special 6",
    collection("6 Special 1").hide,
    collection("6 Special 2").hide,
    collection("6 Special 3").hide,
    collection("6 Special 4").hide,
    collection("6 Special 5").hide,
    collection("6 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial07 = front(
    "Front Special 7",
    collection("7 Special 1").hide,
    collection("7 Special 2").hide,
    collection("7 Special 3").hide,
    collection("7 Special 4").hide,
    collection("7 Special 5").hide,
    collection("7 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial08 = front(
    "Front Special 8",
    collection("8 Special 1").hide,
    collection("8 Special 2").hide,
    collection("8 Special 3").hide,
    collection("8 Special 4").hide,
    collection("8 Special 5").hide,
    collection("8 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial09 = front(
    "Front Special 9",
    collection("9 Special 1").hide,
    collection("9 Special 2").hide,
    collection("9 Special 3").hide,
    collection("9 Special 4").hide,
    collection("9 Special 5").hide,
    collection("9 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial10 = front(
    "Front Special 10",
    collection("10 Special 1").hide,
    collection("10 Special 2").hide,
    collection("10 Special 3").hide,
    collection("10 Special 4").hide,
    collection("10 Special 5").hide,
    collection("10 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial11 = front(
    "Front Special 11",
    collection("11 Special 1").hide,
    collection("11 Special 2").hide,
    collection("11 Special 3").hide,
    collection("11 Special 4").hide,
    collection("11 Special 5").hide,
    collection("11 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial12 = front(
    "Front Special 12",
    collection("12 Special 1").hide,
    collection("12 Special 2").hide,
    collection("12 Special 3").hide,
    collection("12 Special 4").hide,
    collection("12 Special 5").hide,
    collection("12 Special 6").hide
  ).special
    .swatch(Culture)

  def FrontSpecial13 = front(
    "Front Special 13",
    collection("13 Special 1").hide,
    collection("13 Special 2").hide,
    collection("13 Special 3").hide,
    collection("13 Special 4").hide,
    collection("13 Special 5").hide,
    collection("13 Special 6").hide
  ).special
    .swatch(Culture)

}
