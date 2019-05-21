package editions

import java.time.LocalDate

object WeekDay extends Enumeration(0) {

  implicit lazy val implicitConversions = scala.language.implicitConversions

  type WeekDay = Value
  val Mon, Tues, Wed, Thurs, Fri, Sat, Sun = Value
  implicit def WeekDayToInt(weekDay: WeekDay): Int = weekDay.id
  implicit def IntToWeekDay(int: Int): WeekDay = WeekDay(int)
  //def LocalDateToWeekday: WeekDay = ???
}

/*
 * Things we want to model
 * 1. what the collection template looks like
 * 2. what the front template looks like
 * 3. what the daily edition template as a whole looks like
*/

case class FrontPresentation()
case class CollectionPresentation()

case class CapiQuery(query: String) extends AnyVal

import WeekDay._
trait Periodicity
case class Daily() extends Periodicity
case class WeekDays(days: List[WeekDay]) extends Periodicity

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
  availability: Periodicity
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
  def generateEditionTemplate(date: LocalDate, edition: EditionTemplate): EditionTemplateForDate = {

    EditionTemplateForDate("template", List(), Daily())
  }

}


