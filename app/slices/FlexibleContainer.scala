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
    val maxItems = for {
      configJson <- collectionConfigJson
      groupsConfig <- configJson.groupsConfig
      // TODO: this should be per group
      group <- groupsConfig.headOption
      maxItems <- group.maxItems
    } yield maxItems
    maxItems.getOrElse(9)
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
