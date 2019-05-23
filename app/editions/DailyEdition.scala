package editions

object DailyEdition {
  val defaultFrontPresentation = FrontPresentation()
  val defaultCollectionPresentation = CollectionPresentation()
  val template = EditionTemplate(
    name = "Daily Edition",
    fronts = List(
      FrontCommentJournal.front -> Daily(),
      FrontWeekend.front -> WeekDays(List(WeekDay.Sat))
    ),
    availability = Daily()
  )
}

object FrontCommentJournal {
  val collectionComment = CollectionTemplate(
    name = "Comment",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLetters = CollectionTemplate(
    name = "Letters",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionLongRead = CollectionTemplate(
    name = "LongRead",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionObituaries = CollectionTemplate(
    name = "Obituaries",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionPuzzles = CollectionTemplate(
    name = "Puzzles",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Comment / Journal",
    collections = List(
      collectionComment,
      collectionFeatures,
      collectionLetters,
      collectionLongRead,
      collectionObituaries,
      collectionPuzzles
    ),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

object FrontWeekend {
  val collectionBack = CollectionTemplate(
    name = "Back",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionBodyAndMind = CollectionTemplate(
    name = "BodyAndMind",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFamily =CollectionTemplate(
    name = "Family",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFashion =CollectionTemplate(
    name = "Fashion",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionFeatures = CollectionTemplate(
    name = "Features",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionStarters = CollectionTemplate(
    name = "Starters",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val collectionSpace = CollectionTemplate(
    name = "Space",
    prefill = CapiQuery("???"),
    presentation = DailyEdition.defaultCollectionPresentation
  )
  val front = FrontTemplate(
    name = "Weekend",
    collections = List(
      collectionBack,
      collectionBodyAndMind,
      collectionFamily,
      collectionFashion,
      collectionFeatures,
      collectionStarters,
      collectionSpace
    ),
    presentation = DailyEdition.defaultFrontPresentation
  )
}

