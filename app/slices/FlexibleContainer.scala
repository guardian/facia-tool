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
    val totalMaxItems = collectionConfigJson.get.groupsConfig
      .getOrElse(Nil)
      .flatMap(_.maxItems)
      .sum
    totalMaxItems
  }
}

