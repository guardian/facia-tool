package model.editions

import com.gu.editions.PublishedMediaType
import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}

sealed abstract class MediaType extends EnumEntry with Uncapitalised {
  def toPublishedMediaType: PublishedMediaType = this match {
    case MediaType.UseArticleTrail => PublishedMediaType.UseArticleTrail
    case MediaType.Hide => PublishedMediaType.Hide
    case MediaType.Cutout => PublishedMediaType.Cutout
    case MediaType.Slideshow => PublishedMediaType.Slideshow
    case MediaType.Image => PublishedMediaType.Image
  }
}

object MediaType extends PlayEnum[MediaType] {
  case object UseArticleTrail extends MediaType
  case object Hide extends MediaType
  case object Cutout extends MediaType
  case object Slideshow extends MediaType
  case object Image extends MediaType

  override def values = findValues
}