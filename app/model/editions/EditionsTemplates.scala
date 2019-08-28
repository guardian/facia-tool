package model.editions

import java.time.temporal.ChronoField
import java.time.{LocalDate, ZoneId}

import enumeratum.EnumEntry.Uncapitalised
import enumeratum.{EnumEntry, PlayEnum}
import model.editions.templates.DailyEdition
import org.postgresql.util.PGobject
import play.api.libs.json.Json

object EditionsTemplates {
  val templates: Map[String, EditionTemplate] = Map(
    "daily-edition" -> DailyEdition.template
  )

  val getAvailableEditions: List[String] = templates.keys.toList

}

case object WeekDay extends Enumeration(1) {
  implicit lazy val implicitConversions = scala.language.implicitConversions

  type WeekDay = Value
  val Mon, Tues, Wed, Thurs, Fri, Sat, Sun = Value

  implicit def WeekDayToInt(weekDay: WeekDay): Int = weekDay.id
}

sealed abstract class Swatch extends EnumEntry with Uncapitalised

object Swatch extends PlayEnum[Swatch] {

  case object Neutral extends Swatch

  case object News extends Swatch

  case object Opinion extends Swatch

  case object Culture extends Swatch

  case object Lifestyle extends Swatch

  case object Sport extends Swatch

  override def values = findValues
}

case class FrontPresentation(swatch: Swatch) {
  implicit def frontPresentationFormat = Json.format[FrontPresentation]
}

object FrontPresentation {
  implicit def frontPresentationFormat = Json.format[FrontPresentation]
}

case class CollectionPresentation()

case class CapiPrefillQuery(queryString: String, pathType: PathType) {
  def escapedQueryString(): String =
    queryString
      .replace(",", "%2C")
      .replace("|", "%7C")
      .replace("(", "%28")
      .replace(")", "%29")
}

object CapiPrefillQuery {
  implicit def format = Json.format[CapiPrefillQuery]
}

import model.editions.WeekDay._

trait Periodicity {
  def isValid(date: LocalDate): Boolean
}

case class Daily() extends Periodicity {
  def isValid(date: LocalDate) = true
}

case class WeekDays(days: List[WeekDay]) extends Periodicity {
  def isValid(date: LocalDate) =
    days.exists(
      WeekDayToInt(_) == date.getDayOfWeek.get(ChronoField.DAY_OF_WEEK)
    )
}

sealed abstract class PathType extends EnumEntry with Uncapitalised {
  def toPathSegment: String = {
    this match {
      case PathType.Search => "search"
      case PathType.PrintSent => "content/print-sent"
    }
  }
}

object PathType extends PlayEnum[PathType] {

  case object Search extends PathType

  case object PrintSent extends PathType

  override def values = findValues
}

case class CollectionTemplate(
  name: String,
  prefill: Option[CapiPrefillQuery],
  presentation: CollectionPresentation,
  hidden: Boolean = false
)

case class FrontTemplate(
  name: String,
  collections: List[CollectionTemplate],
  presentation: FrontPresentation,
  isSpecial: Boolean = false,
  hidden: Boolean = false
)

case class EditionTemplate(
  fronts: List[(FrontTemplate, Periodicity)],
  zoneId: ZoneId,
  availability: Periodicity,
)

// Issue skeletons are what is generated when you create a new issue for a given date
// (Date + Template) => Skeleton
case class EditionsIssueSkeleton(
  issueDate: LocalDate,
  zoneId: ZoneId,
  fronts: List[EditionsFrontSkeleton]
)

case class EditionsFrontSkeleton(
  name: String,
  collections: List[EditionsCollectionSkeleton],
  presentation: FrontPresentation,
  hidden: Boolean,
  isSpecial: Boolean
) {
  def metadata() = {
    val metadataParam = new PGobject()
    metadataParam.setType("jsonb")
    metadataParam.setValue(Json.toJson(EditionsFrontMetadata(None, Some(presentation.swatch))).toString)
    metadataParam
  }
}


case class EditionsCollectionSkeleton(
  name: String,
  items: List[EditionsArticleSkeleton],
  prefill: Option[CapiPrefillQuery],
  presentation: CollectionPresentation,
  hidden: Boolean
)

case class EditionsArticleSkeleton(
  pageCode: String,
  metadata: ArticleMetadata
)
