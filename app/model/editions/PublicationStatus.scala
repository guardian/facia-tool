package model.editions

import enumeratum.{EnumEntry, PlayEnum}

sealed abstract class PublicationStatus extends EnumEntry

object PublicationStatus extends PlayEnum[PublicationStatus] {
  case object Pending extends PublicationStatus
  case object Published extends PublicationStatus
  override def values = findValues
}
