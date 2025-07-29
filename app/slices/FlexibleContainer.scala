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
	  maybeCollectionConfigJson: Option[CollectionConfigJson]
  ): Int = {
  	maybeCollectionConfigJson match {
		case Some(collectionConfigJson) =>
			collectionConfigJson.groupsConfig.getOrElse(Nil)
				.flatMap(_.maxItems)
				.sum
		case None =>
			stories.size
  	}
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
