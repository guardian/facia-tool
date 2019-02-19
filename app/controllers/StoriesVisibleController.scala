package controllers

import play.api.libs.json.Json
import services.{ContainerService}
import slices.{Story}

object StoriesVisibleRequest {
  implicit val jsonFormat = Json.format[StoriesVisibleRequest]
}

case class StoriesVisibleRequest(
                                  stories: Seq[Story]
                                )

class StoriesVisibleController(
                                val containerService: ContainerService,
                                val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def storiesVisible(containerType: String) = AccessAPIAuthAction(parse.json[StoriesVisibleRequest]) { implicit request =>
    val storiesVisible = containerService.getStoriesVisible(containerType, request.body.stories)

    storiesVisible.map { storiesVisibleResponse => Ok(Json.toJson(storiesVisibleResponse)) } getOrElse {
      NotFound(s"$containerType is not a valid container id")
    }
  }
}
