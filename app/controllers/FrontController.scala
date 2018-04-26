package controllers

import com.gu.facia.client.models.FrontJson
import config.UpdateManager
import permissions.ConfigPermissionCheck
import services.Press
import updates._
import util.Acl
import util.Requests._

class FrontController(val acl: Acl, val auditingUpdates: AuditingUpdates,
                      val updateManager: UpdateManager, val press: Press, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def create = (APIAuthAction andThen new ConfigPermissionCheck(acl)) { request =>
    request.body.read[CreateFront] match {
      case Some(createFrontRequest) =>
        val identity = request.user
        val newCollectionId = updateManager.createFront(createFrontRequest, identity)
        press.fromSetOfIdsWithForceConfig(Set(newCollectionId))
        auditingUpdates.putAudit(AuditUpdate(createFrontRequest, identity.email))
        Ok

      case None => BadRequest
    }
  }

  def update(frontId: String) = (APIAuthAction andThen new ConfigPermissionCheck(acl)){ request =>
    request.body.read[FrontJson] match {
      case Some(front) =>
        val identity = request.user
        updateManager.updateFront(frontId, front, identity)
        press.fromSetOfIdsWithForceConfig(front.collections.toSet)
        auditingUpdates.putAudit(AuditUpdate(UpdateFront(frontId, front), identity.email))
        Ok

      case None => BadRequest
    }
  }
}



