package slices

trait FlexibleContainer {
  def storiesVisible(stories: Seq[Story]): Int
}

object FlexibleGeneral extends FlexibleContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    val byGroup = Story.segmentByGroup(stories)
    val splash = byGroup.getOrElse(3, Seq.empty) ++
            byGroup.getOrElse(2, Seq.empty) ++
            byGroup.getOrElse(1, Seq.empty)
    val numOfSplash = splash.size min 1
    val numOfStandard = stories.size - numOfSplash
    return numOfSplash + (numOfStandard min 10)
  }
}

object FlexibleSpecial extends FlexibleContainer {
  def storiesVisible(stories: Seq[Story]): Int = {
    val byGroup = Story.segmentByGroup(stories)
    val snap = byGroup.getOrElse(3, Seq.empty) ++
            byGroup.getOrElse(2, Seq.empty) ++
            byGroup.getOrElse(1, Seq.empty)
    val standardCards = byGroup.getOrElse(0, Seq.empty)
    return snap.size + (standardCards.size min 5)
  }
}
