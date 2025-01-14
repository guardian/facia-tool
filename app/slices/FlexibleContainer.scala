package slices
import com.gu.facia.client.models.CollectionConfigJson

trait FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      collectionConfigJson: Option[CollectionConfigJson]
  ): Int
}

object FlexibleGeneral extends FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      collectionConfigJson: Option[CollectionConfigJson]
  ): Int = {
    val byGroup = Story.segmentByGroup(stories)
    val splash = byGroup.getOrElse(3, Seq.empty) ++
      byGroup.getOrElse(2, Seq.empty) ++
      byGroup.getOrElse(1, Seq.empty)
    val numOfSplash = splash.size min 1
    val defaultStoryLimit = 9
    val standardStoryLimit = collectionConfigJson match {
      case Some(config) =>
        config.displayHints
          .flatMap(_.maxItemsToDisplay)
          .getOrElse(defaultStoryLimit)
      case None => defaultStoryLimit
    }
    val numOfStandard = standardStoryLimit - numOfSplash
    numOfSplash + numOfStandard
  }
}

object FlexibleSpecial extends FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      collectionConfigJson: Option[CollectionConfigJson]
  ): Int = {
    val byGroup = Story.segmentByGroup(stories)
    val snap = byGroup.getOrElse(3, Seq.empty) ++
      byGroup.getOrElse(2, Seq.empty) ++
      byGroup.getOrElse(1, Seq.empty)
    val standardCards = byGroup.getOrElse(0, Seq.empty)

    snap.size + (standardCards.size min 5)
  }
}
