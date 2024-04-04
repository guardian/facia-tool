package model.editions.templates.feast

import model.editions.templates.TemplateHelpers.{collection, front}
import model.editions.{CapiDateQueryParam, CapiTimeWindowConfigInDays, Daily, EditionTemplate}

import java.time.ZoneId

object FeastNorthernHemisphere extends FeastEdition {
  override val locale = Some("en_GB")
  override val notificationUTCOffset = 0

  val template = EditionTemplate(
    fronts = List(
      MainFront -> Daily(),
      MeatFreeFront -> Daily()
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

  val MainFront = front(
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

  val MeatFreeFront = front(
    "Southern hemisphere",
    collection("Dish of the day"),
    collection("Collection 2"),
    collection("Collection 3"),
    collection("Collection 4"),
  )
}
