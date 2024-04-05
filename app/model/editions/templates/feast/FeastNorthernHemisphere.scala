package model.editions.templates.feast

import model.editions.templates.TemplateHelpers.{collection, front}
import model.editions.{CapiDateQueryParam, CapiTimeWindowConfigInDays, Daily, Edition, EditionTemplate, FrontTemplate}

import java.time.ZoneId

object FeastNorthernHemisphere extends FeastEdition {
  override val title: String = "Feast app [Northern hemisphere]"
  override val edition = Edition.FeastNorthernHemisphere.entryName
  override val locale = Some("en_GB")
  override val notificationUTCOffset = 0

  val MainFront: FrontTemplate = front(
    "All Recipes",
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

  val MeatFreeFront: FrontTemplate = front(
    "Meat-Free Recipes",
    collection("Dish of the day"),
    collection("Collection 2"),
    collection("Collection 3"),
    collection("Collection 4"),
  )

  val template: EditionTemplate = EditionTemplate(
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

}
