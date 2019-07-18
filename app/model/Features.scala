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

object InlineForm extends FeatureSwitch(
  key = "inline-form",
  title = "Use inline form for card overrides",
  enabled = true
)

object FeatureSwitches {
  val all: List[FeatureSwitch] = List(InlineForm)
}
