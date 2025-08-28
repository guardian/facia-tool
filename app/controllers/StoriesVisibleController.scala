package controllers

import logging.Logging
import play.api.libs.json.{Json, OFormat}
import services.{ContainerService, FrontsApi}
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
    val frontsApi: FrontsApi,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {
  def storiesVisible(containerType: String) =
    AccessAPIAuthAction(parse.json[StoriesVisibleRequest]).async {
      implicit request =>
        val futureConfigJson = frontsApi.amazonClient.config
        futureConfigJson.map { configJson =>
          val collectionConfigJson =
            configJson.collections.get(request.body.collectionId)
          val storiesVisible =
            containerService.getStoriesVisible(
              containerType,
              request.body.stories,
              collectionConfigJson
            )

          logger.info(
            s"got stories-visible=$storiesVisible for containerType=$containerType"
          )

          storiesVisible match {
            case Some(storiesVisibleResponse) =>
              Ok(Json.toJson(storiesVisibleResponse))
            case None =>
              val errorMSG =
                s"No container found for type '$containerType'"
              logger.error(errorMSG)
              BadRequest(errorMSG)
          }
        }
    }
}
