package model.editions.templates

import java.time.ZoneId

import model.editions.Swatch._
import model.editions._
import model.editions.templates.TemplateHelpers._

//noinspection TypeAnnotation
object TheGuesserEdition extends InternalEdition {
  override val title = "The Guesser Edition"
  override val subTitle = "Internal usage only, for curating The Guesser"
  override val edition = "the-guesser-edition"
  override val header = Header(title = "The Guesser", subTitle = Some("Edition"))
  override val notificationUTCOffset = 3
  override val topic = "dm"
  override val locale = Some("en_GB")

  lazy val template = EditionTemplate(
    List(
      TheGuesserFront -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = -365,
      endOffset = 0,
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Europe/London"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = Some(OphanQueryPrefillParams(
      apiKey = s"fronts-editions-${this.getClass.toString}",
      timeWindowConfig = TimeWindowConfigInDays(
        startOffset = -365,
        endOffset = 0
      ))
    )
  )

  def TheGuesserFront = front(
    "The Guesser curation front",
    collection("Front Page"),
    collection("News"),
    collection("Sport"),
    collection("Culture"),
  )

}
