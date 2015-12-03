package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.CollectionConfigJson
import config.UpdateManager
import permissions.ConfigPermissionCheck
import play.api.libs.json.Json
import play.api.mvc.Controller
import services.Press
import updates.{CollectionCreate, CollectionUpdate, StreamUpdate, UpdatesStream}
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

object CollectionController extends Controller with PanDomainAuthActions {
  def create = (APIAuthAction andThen ConfigPermissionCheck){ request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = request.user
        val collectionId = UpdateManager.addCollection(frontIds, collection, identity)
        Press.fromSetOfIdsWithForceConfig(Set(collectionId))
        UpdatesStream.putStreamUpdate(StreamUpdate(CollectionCreate(frontIds, collection), identity.email))
        Ok(Json.toJson(CreateCollectionResponse(collectionId)))

      case None => BadRequest
    }
  }

  def update(collectionId: String) =  (APIAuthAction andThen ConfigPermissionCheck){ request =>
    request.body.read[CollectionRequest] match {
      case Some(CollectionRequest(frontIds, collection)) =>
        val identity = request.user
        UpdateManager.updateCollection(collectionId, frontIds, collection, identity)
        Press.fromSetOfIdsWithForceConfig(Set(collectionId))
        UpdatesStream.putStreamUpdate(StreamUpdate(CollectionUpdate(frontIds, collection), identity.email))
        Ok

      case None => BadRequest
    }
  }
}
