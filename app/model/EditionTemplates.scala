package model

import java.time.ZonedDateTime
import java.time.temporal.ChronoField

import org.joda.time.DateTime


object WeekDay extends Enumeration(1) {

  implicit lazy val implicitConversions = scala.language.implicitConversions

  type WeekDay = Value
  val Mon, Tues, Wed, Thurs, Fri, Sat, Sun = Value
  implicit def WeekDayToInt(weekDay: WeekDay): Int = weekDay.id
}

case class FrontPresentation()
case class CollectionPresentation()

case class CapiQuery(query: String) extends AnyVal

import WeekDay._
trait Periodicity {
  def isValid(date: ZonedDateTime): Boolean
}
case class Daily() extends Periodicity {
  def isValid(date: ZonedDateTime) = true
}

case class WeekDays(days: List[WeekDay]) extends Periodicity {
  def isValid(date: ZonedDateTime) = days.exists(WeekDayToInt(_) == date.getDayOfWeek.get(ChronoField.DAY_OF_WEEK))
}

case class CollectionTemplate(
  name: String,
  prefill: CapiQuery,
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
  availability: Periodicity
)

case class EditionTemplateForDate(
  fronts: List[FrontTemplate],
)


