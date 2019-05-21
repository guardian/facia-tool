package editions
import org.joda.time.DateTime

object WeekDay extends Enumeration(0) {

  implicit lazy val implicitConversions = scala.language.implicitConversions

  type WeekDay = Value
  val Mon, Tues, Wed, Thurs, Fri, Sat, Sun = Value
  implicit def WeekDayToInt(weekDay: WeekDay): Int = weekDay.id
  implicit def IntToWeekDay(int: Int): WeekDay = WeekDay(int)
  //def LocalDateToWeekday: WeekDay = ???
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


// ??? Is this how we want to model collections??
object Sport {
  val emptyCollectionPresentation = CollectionPresentation()
  val football: CollectionTemplate = new CollectionTemplate("Football", CapiQuery("???"), emptyCollectionPresentation)
  val cricket: CollectionTemplate = new CollectionTemplate("Cricket", CapiQuery("???"), emptyCollectionPresentation)
}

object Fronts {
  val emptyFrontPresentation = FrontPresentation()
  val ukNews: FrontTemplate = FrontTemplate("UK news", List(), emptyFrontPresentation)
  val sports: FrontTemplate = FrontTemplate(
    "Sport",
    List(
      Sport.football,
      Sport.cricket,
    ),
    emptyFrontPresentation
  )
  val technology: FrontTemplate = FrontTemplate(
    "Technology",
    List(),
    emptyFrontPresentation
  )

  val opinion: FrontTemplate = FrontTemplate("Opinion", List(), emptyFrontPresentation)
}

object DailyEdition {
  val dailyEdition: EditionTemplate = EditionTemplate(
    "dailyEdition",
    List(
      (Fronts.ukNews, Daily()),
      (Fronts.sports, Daily()),
      (Fronts.opinion, WeekDays(List(Thurs, Wed))),
      (Fronts.technology, WeekDays(List(Thurs)))
    ),
    Daily()
  )
}

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


