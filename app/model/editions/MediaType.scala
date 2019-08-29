package model.editions

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}

sealed abstract class MediaType extends EnumEntry with Uncapitalised {
  def toPublishedMediaType: PublishedMediaType = this match {
    case MediaType.UseArticleTrail => PublishedMediaType.UseArticleTrail
    case MediaType.Hide => PublishedMediaType.Hide
    case MediaType.Cutout => PublishedMediaType.Cutout
    case MediaType.Image => PublishedMediaType.Image
    case MediaType.OverrideCoverCard => PublishedMediaType.OverrideCard
  }
}

object MediaType extends PlayEnum[MediaType] {
  case object UseArticleTrail extends MediaType
  case object Hide extends MediaType
  case object Cutout extends MediaType
  case object Image extends MediaType
  case object OverrideCoverCard extends MediaType

  override def values = findValues
}
