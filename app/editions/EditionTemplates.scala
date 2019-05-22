package editions
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
  def isValid(date: DateTime): Boolean
}
case class Daily() extends Periodicity {
  def isValid(date: DateTime) = true
}

case class WeekDays(days: List[WeekDay]) extends Periodicity {
  def isValid(date: DateTime) = days.exists(WeekDayToInt(_) == date.dayOfWeek().get)
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
  name: String,
  fronts: List[(FrontTemplate, Periodicity)],
  availability: Periodicity
)
case class EditionTemplateForDate(
  name: String,
  fronts: List[FrontTemplate],
)

object EditionTemplateHelpers {
  def generateEditionTemplate(date: DateTime, edition: EditionTemplate): Option[EditionTemplateForDate] = {
    edition.availability.isValid(date) match {
      case false => None
      case true => {
        Some(EditionTemplateForDate(edition.name, edition.fronts.filter(_._2.isValid(date)).map(_._1)))
      }
    }
  }
}


