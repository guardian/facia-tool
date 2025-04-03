package model

import play.api.libs.json.{Json, OFormat}

object FeatureSwitch {
  implicit val jsonFormat: OFormat[FeatureSwitch] = Json.format[FeatureSwitch]
}

case class FeatureSwitch(
    key: String,
    title: String,
    enabled: Boolean
)

object ObscureFeed
    extends FeatureSwitch(
      key = "obscure-feed",
      title = "Obscure the feed -- it's distracting for developers!",
      enabled = false
    )

object PageViewDataVisualisation
    extends FeatureSwitch(
      key = "page-view-data-visualisation",
      title = "Show page view data visualisation (aka spark lines)",
      enabled = true
    )

object TenImageSlideshows
    extends FeatureSwitch(
      key = "ten-image-slideshows",
      title = "Allow slideshows to contain 10 images rather than 5",
      enabled = false
    )

object SupportImmersiveToggle
    extends FeatureSwitch(
      key = "support-immersive-toggle",
      title = "Allow users to set a card as an immersive display card",
      enabled = false
    )

object FeatureSwitches {
  val all: List[FeatureSwitch] = List(
    ObscureFeed,
    PageViewDataVisualisation,
    TenImageSlideshows,
    SupportImmersiveToggle
  )

  def updateFeatureSwitchesForUser(
      userDataSwitches: Option[List[FeatureSwitch]],
      switch: FeatureSwitch
  ): List[FeatureSwitch] = {
    val newSwitches = userDataSwitches match {
      case Some(switches) =>
        val defaultSwitches = all.filter(defaultSwitch =>
          !switches.exists(
            _.key == defaultSwitch.key
          ) && defaultSwitch.key != switch.key
        )
        defaultSwitches ++ switches.filter(_.key != switch.key) ++ List(switch)
      case None =>
        all.filter(_.key != switch.key) ++ List(switch)
    }
    removeUnknownSwitches(newSwitches)
  }

  def removeUnknownSwitches(featureSwitches: List[FeatureSwitch]) =
    featureSwitches.filter(featureSwitch =>
      FeatureSwitches.all.exists(_.key == featureSwitch.key)
    )
}
