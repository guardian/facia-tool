package editions

import WeekDay._

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

