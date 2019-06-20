package model.editions

import java.time.{ZoneId, ZonedDateTime}
import java.time.temporal.ChronoField

import model.editions.templates.DailyEdition
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

case class FrontPresentation()
case class CollectionPresentation()

case class CapiPrefillQuery(queryString: String) extends AnyVal

object CapiPrefillQuery {
  implicit def format = Json.format[CapiPrefillQuery]
}

import WeekDay._
trait Periodicity {
  def isValid(date: ZonedDateTime): Boolean
}
case class Daily() extends Periodicity {
  def isValid(date: ZonedDateTime) = true
}

case class WeekDays(days: List[WeekDay]) extends Periodicity {
  def isValid(date: ZonedDateTime) =
    days.exists(
      WeekDayToInt(_) == date.getDayOfWeek.get(ChronoField.DAY_OF_WEEK)
    )
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
    issueDate: ZonedDateTime,
    zoneId: ZoneId,
    fronts: List[EditionsFrontSkeleton]
)

case class EditionsFrontSkeleton(
    name: String,
    collections: List[EditionsCollectionSkeleton],
    presentation: FrontPresentation,
    hidden: Boolean = false
)

case class EditionsCollectionSkeleton(
    name: String,
    items: List[String],
    prefill: Option[CapiPrefillQuery],
    presentation: CollectionPresentation,
    hidden: Boolean = false
)
