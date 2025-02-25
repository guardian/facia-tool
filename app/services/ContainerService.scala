package services

import play.api.libs.json.{Json, OFormat}
import slices._
import com.gu.facia.client.models.CollectionConfigJson

case class StoriesVisible(
    desktop: Option[Int],
    mobile: Option[Int],
    groupName: Option[String] = None
)

object StoriesVisible {
  implicit val jsonFormat: OFormat[StoriesVisible] =
    Json.format[StoriesVisible]
}

case class StoriesVisibleResponse(
    response: List[StoriesVisible]
)

object StoriesVisibleResponse {
  implicit val jsonFormat: OFormat[StoriesVisibleResponse] =
    Json.format[StoriesVisibleResponse]
}

class ContainerService(val containers: Containers) {
  def getStoriesVisible(
      containerType: String,
      stories: Seq[Story],
      collectionConfigJson: Option[CollectionConfigJson]
  ): Option[StoriesVisibleResponse] = {
    val numberOfStories = stories.length
    containers.all.get(containerType) map {
      case Fixed(container) =>
        val maxDesktop = container.numItems
        val desktopVisible = maxDesktop min numberOfStories
        StoriesVisibleResponse(
          List(StoriesVisible(
                Some(desktopVisible),
                container.mobileShowMore match {
                  case DesktopBehaviour => Some(desktopVisible)
                  case RestrictTo(maxMobile) if maxMobile > desktopVisible =>
                    Some(desktopVisible)
                  case RestrictTo(maxMobile) => Some(maxMobile min numberOfStories)
                }
              )))
      case Scrollable(container) =>
        val numberVisible = container.storiesVisible(stories)
        StoriesVisibleResponse(
          List(StoriesVisible(
            Some(numberVisible),
            Some(numberVisible)
          )))

      case Dynamic(container) =>
        val slices = container.slicesFor(stories)
        val maxItems = slices.map(_.map(_.layout.numItems).sum).getOrElse(0)
        val numberVisible = maxItems min numberOfStories
        StoriesVisibleResponse(
          List(StoriesVisible(
            Some(numberVisible),
            Some(numberVisible)
        )))

      case Flexible(container) =>
        val numberVisible = container.storiesVisible(
          stories,
          collectionConfigJson
        )
        StoriesVisibleResponse(
          List(StoriesVisible(
            Some(numberVisible),
            Some(numberVisible)
          )))

      case MostPopular =>
        StoriesVisibleResponse(
          List(StoriesVisible(
            Some(10 min numberOfStories),
            Some(10 min numberOfStories)
          )))

      case NavList | NavMediaList =>
        StoriesVisibleResponse(
          List(StoriesVisible(
            None,
            None
        )))
    }
  }
}
