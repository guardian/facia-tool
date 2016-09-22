package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import play.api.libs.json.Json
import play.api.mvc.Controller
import slices._

object StoriesVisibleRequest {
  implicit val jsonFormat = Json.format[StoriesVisibleRequest]
}

case class StoriesVisibleRequest(
  stories: Seq[Story]
)

object StoriesVisibleResponse {
  implicit val jsonFormat = Json.format[StoriesVisibleResponse]
}

case class StoriesVisibleResponse(
  desktop: Option[Int],
  mobile: Option[Int]
)

class StoriesVisibleController(val config: ApplicationConfiguration, val containers: Containers) extends Controller with PanDomainAuthActions {
  def storiesVisible(containerType: String) = APIAuthAction(parse.json[StoriesVisibleRequest]) { implicit request =>
    val numberOfStories = request.body.stories.length

    containers.all.get(containerType) map {
      case Fixed(container) =>
        val maxDesktop = container.numItems
        val desktopVisible = maxDesktop min numberOfStories

        Ok(Json.toJson(StoriesVisibleResponse(
          Some(desktopVisible),
          container.mobileShowMore match {
            case DesktopBehaviour => Some(desktopVisible)
            case RestrictTo(maxMobile) if maxMobile > desktopVisible => Some(desktopVisible)
            case RestrictTo(maxMobile) => Some(maxMobile min numberOfStories)
          }
        )))

      case Dynamic(container) =>
        val slices = container.slicesFor(request.body.stories)

        val maxItems = slices.map(_.map(_.layout.numItems).sum).getOrElse(0)
        val numberVisible = maxItems min numberOfStories

        Ok(Json.toJson(StoriesVisibleResponse(
          Some(numberVisible),
          Some(numberVisible)
        )))

      case MostPopular =>
        Ok(Json.toJson(StoriesVisibleResponse(
          Some(10 min numberOfStories),
          Some(10 min numberOfStories)
        )))

      case NavList | NavMediaList =>
        Ok(Json.toJson(StoriesVisibleResponse(
          None,
          None
        )))

    } getOrElse {
      NotFound(s"$containerType is not a valid container id")
    }
  }
}
