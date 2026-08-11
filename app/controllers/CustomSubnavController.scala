package controllers

import com.gu.facia.client.models.CustomSubnav
import model.NoCache
import permissions.ConfigureSubnavsPermissionCheck
import play.api.libs.json.Json
import services.{CustomSubnavApi, CustomSubnavConfigFunctions}
import util.Acl
import util.Requests._
import logging.Logging

import scala.concurrent.ExecutionContext

/** CRUD-style endpoints for managing custom subnavs. All actions are gated
  * behind the `configure_custom_subnavs` permission. Reads and writes go
  * through [[CustomSubnavApi]] (uncached S3) and mutate a single shared config
  * document.
  */
class CustomSubnavController(
    val acl: Acl,
    customSubnavApi: CustomSubnavApi,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {

  def getSubnavConfig =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        NoCache {
          Ok(Json.toJson(customSubnavApi.getConfig())).as("application/json")
        }
    }

  def upsertSubnav =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      request =>
        request.body.read[CustomSubnav] match {
          case Some(subnav) =>
            val stamped =
              CustomSubnavConfigFunctions.stamp(subnav, request.user)
            val updated = CustomSubnavConfigFunctions.upsertDraft(
              customSubnavApi.getConfig(),
              stamped
            )
            customSubnavApi.putConfig(updated)
            Ok(Json.toJson(updated)).as("application/json")
          case None => BadRequest
        }
    }

  def publishSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        val updated =
          CustomSubnavConfigFunctions.publish(customSubnavApi.getConfig(), id)
        customSubnavApi.putConfig(updated)
        Ok(Json.toJson(updated)).as("application/json")
    }

  def discardSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        val updated =
          CustomSubnavConfigFunctions.discard(customSubnavApi.getConfig(), id)
        customSubnavApi.putConfig(updated)
        Ok(Json.toJson(updated)).as("application/json")
    }

  def unpublishSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        val updated =
          CustomSubnavConfigFunctions.unpublish(customSubnavApi.getConfig(), id)
        customSubnavApi.putConfig(updated)
        Ok(Json.toJson(updated)).as("application/json")
    }

  def deleteSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        val updated =
          CustomSubnavConfigFunctions.delete(customSubnavApi.getConfig(), id)
        customSubnavApi.putConfig(updated)
        Ok(Json.toJson(updated)).as("application/json")
    }
}
