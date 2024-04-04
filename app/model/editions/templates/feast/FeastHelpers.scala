package model.editions.templates.feast

import model.editions.templates.CuratedPlatformWithTemplate

trait FeastEdition extends CuratedPlatformWithTemplate {
  override val title = "Feast app"
  override val subTitle = "Make inspiring mealtimes easy with the Guardian’s Feast app."
  override val app = "feast"
}
