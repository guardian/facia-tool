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

object FeastUSRegion extends FeastAppEdition {
  override val title: String = "Feast app [US region]"
  override val edition = Edition.FeastUSRegion.entryName
  override val locale = Some("en_US")
  override val notificationUTCOffset: Int = 0

  override val path: String = "us"

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
    zoneId = ZoneId.of("America/New_York"),
    availability = Daily(),
    maybeOphanPath = None,
    ophanQueryPrefillParams = None
  )
}
