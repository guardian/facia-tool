package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.FrontJson
import config.UpdateManager
import permissions.ConfigPermissionCheck
import play.api.mvc.Controller
import services.Press
import updates.{CreateFront, StreamUpdate, UpdateFront, UpdatesStream}
import util.Requests._

object FrontController extends Controller with PanDomainAuthActions {
  def create = (APIAuthAction andThen ConfigPermissionCheck) { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = request.user
        val newCollectionId = UpdateManager.createFront(createFrontRequest, identity)
        Press.fromSetOfIdsWithForceConfig(Set(newCollectionId))
        UpdatesStream.putStreamUpdate(StreamUpdate(createFrontRequest, identity.email))
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = (APIAuthAction andThen ConfigPermissionCheck){ request =>
    request.body.read[FrontJson] match {
      case Some(front) =>
        val identity = request.user
        UpdateManager.updateFront(frontId, front, identity)
        Press.fromSetOfIdsWithForceConfig(front.collections.toSet)
        UpdatesStream.putStreamUpdate(StreamUpdate(UpdateFront(frontId, front), identity.email))
        Ok

      case None => BadRequest
    }
  }
}



