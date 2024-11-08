package controllers

import scala.concurrent.ExecutionContext
import com.gu.facia.client.models.CollectionConfigJson
import config.UpdateManager
import permissions.ConfigPermissionCheck
import play.api.libs.json.{Json, OFormat}
import services.Press
import updates._
import util.Acl
import util.Requests._
import logging.Logging

object CollectionRequest {
  implicit val jsonFormat: OFormat[CollectionRequest] =
    Json.format[CollectionRequest]
}

case class CollectionRequest(
    frontIds: List[String],
    collection: CollectionConfigJson
)

object CreateCollectionResponse {
  implicit val jsonFormat: OFormat[CreateCollectionResponse] =
    Json.format[CreateCollectionResponse]
}

case class CreateCollectionResponse(id: String)

class CollectionController(
    val acl: Acl,
    val structuredLogger: StructuredLogger,
    val updateManager: UpdateManager,
    val press: Press,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {
  def create = (AccessAPIAuthAction andThen new ConfigPermissionCheck(acl)) {
    request =>
      request.body.read[CollectionRequest] match {
        case Some(CollectionRequest(frontIds, collection)) =>
          val identity = request.user
          val collectionId =
            updateManager.addCollection(frontIds, collection, identity)
          press.fromSetOfIdsWithForceConfig(Set(collectionId))
          structuredLogger.putLog(
            LogUpdate(
              CollectionCreate(frontIds, collection, collectionId),
              identity.email
            )
          )
          Ok(Json.toJson(CreateCollectionResponse(collectionId)))

        case None => BadRequest
      }
  }

  def update(collectionId: String) =
    (AccessAPIAuthAction andThen new ConfigPermissionCheck(acl)) { request =>
      request.body.read[CollectionRequest] match {
        case Some(CollectionRequest(frontIds, collection)) =>
          val identity = request.user
          updateManager.updateCollection(
            collectionId,
            frontIds,
            collection,
            identity
          )
          press.fromSetOfIdsWithForceConfig(Set(collectionId))
          structuredLogger.putLog(
            LogUpdate(
              CollectionUpdate(frontIds, collection, collectionId),
              identity.email
            )
          )
          Ok

        case None => BadRequest
      }
    }
}
