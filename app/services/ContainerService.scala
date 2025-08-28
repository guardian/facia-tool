package services

import com.gu.facia.client.models.{CollectionConfigJson, ConfigJson}
import play.api.libs.json.{Json, OFormat}
import slices._

import scala.concurrent.ExecutionContext

case class StoriesVisibleResponse(
    desktop: Option[Int],
    mobile: Option[Int]
)

object StoriesVisibleResponse {
  implicit val jsonFormat: OFormat[StoriesVisibleResponse] =
    Json.format[StoriesVisibleResponse]
}

class ContainerService(val containers: Containers, val frontsApi: FrontsApi) {
  def getStoriesVisible(
      containerType: String,
      stories: Seq[Story],
      collectionConfigJson: Option[CollectionConfigJson]
  ) = {
    val numberOfStories = stories.length

    containers.all.get(containerType) map {
      case Fixed(container) =>
        val maxDesktop = container.numItems
        val desktopVisible = maxDesktop min numberOfStories

        StoriesVisibleResponse(
          Some(desktopVisible),
          container.mobileShowMore match {
            case DesktopBehaviour => Some(desktopVisible)
            case RestrictTo(maxMobile) if maxMobile > desktopVisible =>
              Some(desktopVisible)
            case RestrictTo(maxMobile) => Some(maxMobile min numberOfStories)
          }
        )

      case Scrollable(container) =>
        val numberVisible = container.storiesVisible(stories)
        StoriesVisibleResponse(
          Some(numberVisible),
          Some(numberVisible)
        )

      case Dynamic(container) =>
        val slices = container.slicesFor(stories)
        val maxItems = slices.map(_.map(_.layout.numItems).sum).getOrElse(0)
        val numberVisible = maxItems min numberOfStories
        StoriesVisibleResponse(
          Some(numberVisible),
          Some(numberVisible)
        )

      case Flexible(container) =>
        val numberVisible = container.storiesVisible(
          stories,
          collectionConfigJson
        )
        StoriesVisibleResponse(
          Some(numberVisible),
          Some(numberVisible)
        )

      case MostPopular =>
        StoriesVisibleResponse(
          Some(10 min numberOfStories),
          Some(10 min numberOfStories)
        )

      case NavList | NavMediaList =>
        StoriesVisibleResponse(
          None,
          None
        )
    }
  }
}
