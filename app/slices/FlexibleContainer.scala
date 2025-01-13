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
    val numOfStandard = stories.size - numOfSplash
    val defaultStandardStoryLimit = 8

    val standardStoryLimit = collectionConfigJson match {
      case Some(config) =>
        config.displayHints
          .flatMap(_.maxItemsToDisplay)
          .getOrElse(defaultStandardStoryLimit)
      case None => defaultStandardStoryLimit
    }

    numOfSplash + (numOfStandard min standardStoryLimit)
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
