package slices
import com.gu.facia.client.models.CollectionConfigJson

trait FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      maybeCollectionConfigJson: Option[CollectionConfigJson]
  ): Int
}

object FlexibleGeneral extends FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      maybeCollectionConfigJson: Option[CollectionConfigJson]
  ): Int = {

    val groupNameToIdMap = Map(
      "splash" -> 3,
      "very big" -> 2,
      "big" -> 1,
      "standard" -> 0
    )

    val byGroup = Story.segmentByGroup(stories)
    val numberOfStoriesVisible = for {
      collectionConfigJson <- maybeCollectionConfigJson
      groupsConfig <- collectionConfigJson.groupsConfig
    } yield {
      groupsConfig.map { group =>
        val maxItems = group.maxItems
        val maybeGroupId = groupNameToIdMap.get(group.name.toLowerCase)
        val currentItemSize = maybeGroupId match {
          case Some(groupId) => byGroup.getOrElse(groupId, Seq.empty).size
          case None          => 0
        }
        currentItemSize min maxItems.getOrElse(currentItemSize)
      }.sum
    }
    numberOfStoriesVisible.getOrElse(stories.size)
  }
}

object FlexibleSpecial extends FlexibleContainer {
  def storiesVisible(
      stories: Seq[Story],
      maybeCollectionConfigJson: Option[CollectionConfigJson]
  ): Int = {
    val byGroup = Story.segmentByGroup(stories)
    val snap = byGroup.getOrElse(3, Seq.empty) ++
      byGroup.getOrElse(2, Seq.empty) ++
      byGroup.getOrElse(1, Seq.empty)
    val standardCards = byGroup.getOrElse(0, Seq.empty)

    snap.size + (standardCards.size min 5)
  }
}
