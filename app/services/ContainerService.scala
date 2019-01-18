package services

import play.api.libs.json.Json
import slices._

case class StoriesVisibleResponse(
                                   desktop: Option[Int],
                                   mobile: Option[Int]
                                 )

object StoriesVisibleResponse {
  implicit val jsonFormat = Json.format[StoriesVisibleResponse]
}

class ContainerService(val containers: Containers) {
  def getStoriesVisible(containerType: String, stories: Seq[Story]) = {
    val numberOfStories = stories.length
    containers.all.get(containerType) map {
      case Fixed(container) => {
        val maxDesktop = container.numItems
        val desktopVisible = maxDesktop min numberOfStories

        StoriesVisibleResponse(
          Some(desktopVisible),
          container.mobileShowMore match {
            case DesktopBehaviour => Some(desktopVisible)
            case RestrictTo(maxMobile) if maxMobile > desktopVisible => Some(desktopVisible)
            case RestrictTo(maxMobile) => Some(maxMobile min numberOfStories)
          }
        )
      }
      case Dynamic(container) => {
        val slices = container.slicesFor(stories)
        val maxItems = slices.map(_.map(_.layout.numItems).sum).getOrElse(0)
        val numberVisible = maxItems min numberOfStories
        StoriesVisibleResponse(
          Some(numberVisible),
          Some(numberVisible)
        )
      }
      case MostPopular =>
        StoriesVisibleResponse(
          Some(10 min numberOfStories),
          Some(10 min numberOfStories)
        )
      case NavList | NavMediaList => StoriesVisibleResponse(
        None,
        None
      )
    }
  }
}
