package model.editions.templates.feast

import model.editions.templates.TemplateHelpers.{collection, front}
import model.editions.{
  CapiDateQueryParam,
  CapiTimeWindowConfigInDays,
  Daily,
  Edition,
  EditionTemplate,
  FrontTemplate
}

import java.time.ZoneId

object FeastSouthernHemisphere extends FeastAppEdition {
  override val title: String = "Feast app [Southern hemisphere]"
  override val edition = Edition.FeastSouthernHemisphere.entryName
  override val locale = Some("en_GB")
  override val notificationUTCOffset = 0
  override val path: String = "southern"

  val MainFront: FrontTemplate = front(
    "All Recipes",
    collection("Dish of the day")
  )

  val MeatFreeFront: FrontTemplate = front(
    "Meat-Free",
    collection("Dish of the day")
  )

  val template: EditionTemplate = EditionTemplate(
    fronts = List(
      MainFront -> Daily(),
      MeatFreeFront -> Daily()
    ),
    timeWindowConfig = CapiTimeWindowConfigInDays(
      startOffset = 0,
      endOffset = 0
    ),
    capiDateQueryParam = CapiDateQueryParam.Published,
    zoneId = ZoneId.of("Australia/Sydney"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = None
  )
}
