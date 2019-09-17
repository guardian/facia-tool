package model.editions

import enumeratum.{EnumEntry, PlayEnum}

sealed abstract class PublicationStatus extends EnumEntry

// Should match the `Status` provided by the Editions Archiver lambda
// See https://github.com/guardian/editions/blob/7b887ba2d0d578eeb58f6a0fedf91910b582e80d/projects/archiver/src/eventTask.ts#L9
object PublicationStatus extends PlayEnum[PublicationStatus] {
  case object Processing extends PublicationStatus
  case object Published extends PublicationStatus
  case object Failed extends PublicationStatus
  override def values = findValues

  val DEFAULT: PublicationStatus = Processing
}
