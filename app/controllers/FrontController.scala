package controllers

import com.gu.facia.client.models.FrontJson
import config.UpdateManager
import permissions.ConfigPermissionCheck
import services.Press
import updates._
import util.Acl
import util.Requests._
import logging.Logging

import scala.concurrent.ExecutionContext

class FrontController(
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
      request.body.read[CreateFront] match {
        case Some(createFrontRequest) =>
          val identity = request.user
          val newCollectionId =
            updateManager.createFront(createFrontRequest, identity)
          press.fromSetOfIdsWithForceConfig(Set(newCollectionId))
          structuredLogger.putLog(LogUpdate(createFrontRequest, identity.email))
          Ok

        case None => BadRequest
      }
  }

  def update(frontId: String) =
    (AccessAPIAuthAction andThen new ConfigPermissionCheck(acl)) { request =>
      request.body.read[FrontJson] match {
        case Some(front) =>
          val identity = request.user
          updateManager.updateFront(frontId, front, identity)
          press.fromSetOfIdsWithForceConfig(front.collections.toSet)
          structuredLogger.putLog(
            LogUpdate(UpdateFront(frontId, front), identity.email)
          )
          Ok

        case None => BadRequest
      }
    }
}
