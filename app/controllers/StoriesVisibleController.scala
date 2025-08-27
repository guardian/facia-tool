package controllers

import logging.Logging
import play.api.libs.json.{Json, OFormat}
import services.ContainerService
import slices.Story

import scala.concurrent.ExecutionContext

object StoriesVisibleRequest {
  implicit val jsonFormat: OFormat[StoriesVisibleRequest] =
    Json.format[StoriesVisibleRequest]
}

case class StoriesVisibleRequest(
    stories: Seq[Story],
	collectionId: String
)

class StoriesVisibleController(
    val containerService: ContainerService,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)
    with Logging {
  def storiesVisible(containerType: String) =
    AccessAPIAuthAction(parse.json[StoriesVisibleRequest]).async { implicit request =>
      val storiesVisible =
        containerService.getStoriesVisible(
          containerType,
          request.body.stories,
          request.body.collectionId
        )

      logger.info(
        s"got stories-visible=$storiesVisible for containerType=$containerType"
      )

      storiesVisible.map {
        case Some(storiesVisibleResponse) => Ok(Json.toJson(storiesVisibleResponse))
        case None =>
          val errorMSG =
            s"No container found for type '$containerType'"
          logger.error(errorMSG)
          BadRequest(errorMSG)
      }
    }
}
