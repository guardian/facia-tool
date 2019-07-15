package model.editions

import enumeratum.{EnumEntry, PlayEnum}
import enumeratum.EnumEntry.Camelcase

sealed abstract class ImageOption extends EnumEntry with Camelcase
object ImageOption extends PlayEnum[ImageOption] {
  case object UseArticleTrail extends ImageOption
  case object Hide extends ImageOption
  case object ReplaceCutout extends ImageOption
  case object ReplaceSlideshow extends ImageOption
  case object Replace extends ImageOption

  override def values = findValues
}
