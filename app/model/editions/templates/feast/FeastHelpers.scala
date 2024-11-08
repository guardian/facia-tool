package model.editions.templates.feast

import model.editions.CuratedPlatform
import model.editions.templates.CuratedPlatformWithTemplate

trait FeastAppEdition extends CuratedPlatformWithTemplate {
  override val title = "Feast app"
  override val subTitle =
    "Make inspiring mealtimes easy with the Guardian’s Feast app."
  override val platform = CuratedPlatform.Feast

  // The path of the edition as published to the recipe backend
  val path: String
}
