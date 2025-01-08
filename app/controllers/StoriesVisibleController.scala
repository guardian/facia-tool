package controllers

import logging.Logging
import play.api.libs.json.{Json, OFormat}
import services.ContainerService
import slices.Story

object StoriesVisibleRequest {
  implicit val jsonFormat: OFormat[StoriesVisibleRequest] =
    Json.format[StoriesVisibleRequest]
}

case class StoriesVisibleRequest(
    stories: Seq[Story]
)

class StoriesVisibleController(
    val containerService: ContainerService,
    val deps: BaseFaciaControllerComponents
) extends BaseFaciaController(deps)
    with Logging {
  def storiesVisible(containerType: String) =
    AccessAPIAuthAction(parse.json[StoriesVisibleRequest]) { implicit request =>
      val storiesVisible =
        containerService.getStoriesVisible(containerType, request.body.stories, collectionConfigJson = null)

      logger.info(
        s"got stories-visible=$storiesVisible for containerType=$containerType"
      )

      storiesVisible.map { storiesVisibleResponse =>
        Ok(Json.toJson(storiesVisibleResponse))
      } getOrElse {
        val errorMSG = s"'$containerType' is not a valid container type"
        logger.error(errorMSG)
        BadRequest(errorMSG)
      }
    }
}
