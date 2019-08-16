package model

import play.api.libs.json.Json

object FeatureSwitch {
  implicit val jsonFormat = Json.format[FeatureSwitch]
}

case class FeatureSwitch(
  key: String,
  title: String,
  enabled: Boolean
)

object ObscureFeed extends FeatureSwitch(
  key = "obscure-feed",
  title = "Obscure the feed -- it's distracting for developers!",
  enabled = false
)

object PageViewDataVisualisation extends FeatureSwitch(
  key = "page-view-data-visualisation",
  title = "Show page view data visualisation (aka spark lines)",
  enabled = true
)

object FeatureSwitches {
  val all: List[FeatureSwitch] = List(ObscureFeed, PageViewDataVisualisation)

  def updateFeatureSwitchesForUser(userDataSwitches: Option[List[FeatureSwitch]], switch: FeatureSwitch): List[FeatureSwitch] = {
    userDataSwitches match {
      case Some(switches) =>
        all.diff(switches) ++ switches.filter(_.key != switch.key) ++ List(switch)
      case None =>
        all.filter(_.key != switch.key) ++ List(switch)
    }
  }
}
