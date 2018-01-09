package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.CollectionConfigJson
import conf.ApplicationConfiguration
import config.UpdateManager
import permissions.ConfigPermissionCheck
import play.api.libs.json.Json
import play.api.mvc.Controller
import services.Press
import updates._
import util.Acl
import util.Requests._

object CollectionRequest {
  implicit val jsonFormat = Json.format[CollectionRequest]
}

case class CollectionRequest(
  frontIds: List[String],
  collection: CollectionConfigJson
)

object CreateCollectionResponse {
  implicit val jsonFormat = Json.format[CreateCollectionResponse]
}

case class CreateCollectionResponse(id: String)

class CollectionController(val config: ApplicationConfiguration, val acl: Acl, val auditingUpdates: AuditingUpdates,
                           val updateManager: UpdateManager, val press: Press) extends Controller with PanDomainAuthActions {
  def create = (APIAuthAction andThen new ConfigPermissionCheck(acl)){ request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>

        val identity = request.user
        val collectionId = updateManager.addCollection(frontIds, collection, identity)
        press.fromSetOfIdsWithForceConfig(Set(collectionId))
        auditingUpdates.putStreamUpdate(StreamUpdate(CollectionCreate(frontIds, collection, collectionId), identity.email))
        Ok(Json.toJson(CreateCollectionResponse(collectionId)))

      case None => BadRequest
    }
  }

  def update(collectionId: String) =  (APIAuthAction andThen new ConfigPermissionCheck(acl)){ request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>

        val identity = request.user
        updateManager.updateCollection(collectionId, frontIds, collection, identity)
        press.fromSetOfIdsWithForceConfig(Set(collectionId))
        auditingUpdates.putStreamUpdate(StreamUpdate(CollectionUpdate(frontIds, collection, collectionId), identity.email))
        Ok

      case None => BadRequest
    }
  }
}
