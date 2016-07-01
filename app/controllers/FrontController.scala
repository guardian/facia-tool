package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.FrontJson
import conf.ApplicationConfiguration
import config.UpdateManager
import permissions.{ConfigPermissionCheck, Permissions, ToolsAccessPermissionCheck}
import play.api.mvc.Controller
import services.Press
import updates._
import util.Acl
import util.Requests._

class FrontController(val config: ApplicationConfiguration, val acl: Acl, val auditingUpdates: AuditingUpdates,
                      val updateManager: UpdateManager, val press: Press, val permissions: Permissions) extends Controller with PanDomainAuthActions {
  def create = (APIAuthAction andThen new ToolsAccessPermissionCheck(permissions) andThen new ConfigPermissionCheck(acl)) { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = request.user
        val newCollectionId = updateManager.createFront(createFrontRequest, identity)
        press.fromSetOfIdsWithForceConfig(Set(newCollectionId))
        auditingUpdates.putStreamUpdate(StreamUpdate(createFrontRequest, identity.email))
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = (APIAuthAction andThen new ToolsAccessPermissionCheck(permissions) andThen new ConfigPermissionCheck(acl)){ request =>
    request.body.read[FrontJson] match {
      case Some(front) =>
        val identity = request.user
        updateManager.updateFront(frontId, front, identity)
        press.fromSetOfIdsWithForceConfig(front.collections.toSet)
        auditingUpdates.putStreamUpdate(StreamUpdate(UpdateFront(frontId, front), identity.email))
        Ok

      case None => BadRequest
    }
  }
}



