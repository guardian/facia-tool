package model.editions.templates

import model.editions.templates.TemplateHelpers.{front, collection}
import model.editions._
import java.time.ZoneId

object Feast extends EditionDefinition {
  override val title = "Feast app"
  override val subTitle = "Make inspiring mealtimes easy with the Guardian’s Feast app."
  override val app = "feast"
  override val locale = Some("en_GB")
  override val notificationUTCOffset = 0

  val template = EditionTemplate(
    fronts = List(
      NorthernHemisphere -> Daily(),
      SouthernHemisphere -> Daily()
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

  val NorthernHemisphere = front(
    "Northern hemisphere",
    collection("Dish of the day"),
    collection("Collection 2"),
    collection("Collection 3"),
    collection("Collection 4"),
    collection("Collection 5"),
    collection("Collection 6"),
    collection("Collection 7"),
    collection("Collection 8"),
    collection("Collection 9")
  )

  val SouthernHemisphere = front(
    "Southern hemisphere",
    collection("Dish of the day"),
    collection("Collection 2"),
    collection("Collection 3"),
    collection("Collection 4"),
  )
}
