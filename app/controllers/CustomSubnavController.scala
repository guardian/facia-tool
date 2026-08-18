package controllers

import com.gu.facia.client.models.{CustomSubnav, CustomSubnavConfig}
import model.NoCache
import permissions.ConfigureSubnavsPermissionCheck
import play.api.libs.json.{JsObject, Json}
import play.api.mvc.Result
import services.{CustomSubnavApi, CustomSubnavConfigFunctions}
import util.Acl
import util.Requests._
import logging.Logging

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

/** Endpoints for managing custom subnavs. All actions are gated behind the
  * `configure_custom_subnavs` permission, S3 operations mutate a single shared
  * config document holding two parallel lists: `live` (rendered by platforms)
  * and `draft` (unpublished versions edited in the fronts tool).
  *
  * API contract:
  *   - `GET /custom-subnav` – return the whole config (`{ live, draft }`).
  *   - `PUT /custom-subnav/:id` – upsert a single subnav into `draft` (create
  *     or update the entry with that id). The id is client-supplied (a uuid)
  *     and must match the body; audit fields are stamped server-side. 200 on a
  *     valid body, 400 on a malformed one, 409 if the body id != path id.
  *   - `POST /custom-subnav/:id/publish` – promote a draft entry into `live`.
  *   - `POST /custom-subnav/:id/discard` – drop a draft entry.
  *   - `POST /custom-subnav/:id/unpublish` – move a live entry back to `draft`.
  *   - `DELETE /custom-subnav/:id` – remove the id from both lists.
  */
class CustomSubnavController(
    val acl: Acl,
    customSubnavApi: CustomSubnavApi,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {

  /** Load the config to base a mutation on
    */
  private def configForMutation: Either[Result, CustomSubnavConfig] =
    customSubnavApi
      .getConfig()
      .left
      .map(message =>
        InternalServerError(s"Refusing to modify custom subnavs: $message")
      )

  private def persist(config: CustomSubnavConfig): Result =
    customSubnavApi.putConfig(config) match {
      case Success(saved) => Ok(Json.toJson(saved)).as("application/json")
      case Failure(_) =>
        InternalServerError("Failed to save custom subnav config")
    }

  private def mutate(
      id: String
  )(f: CustomSubnavConfig => Option[CustomSubnavConfig]): Result =
    configForMutation match {
      case Left(error) => error
      case Right(config) =>
        f(config) match {
          case Some(updated) => persist(updated)
          case None => NotFound(s"No custom subnav found with id '$id'")
        }
    }

  def getSubnavConfig =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        NoCache {
          val (config, warning) = customSubnavApi.getConfig() match {
            case Right(c) => (c, None)
            case Left(message) =>
              (CustomSubnavConfigFunctions.empty, Some(message))
          }
          val body = Json.toJson(config).as[JsObject] ++ Json.obj(
            "warning" -> warning
          )
          Ok(body).as("application/json")
        }
    }

  def upsertSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      request =>
        request.body.read[CustomSubnav] match {
          case Some(subnav) if subnav.id != id =>
            Conflict(
              s"Body id '${subnav.id}' does not match path id '$id'"
            )
          case Some(subnav) =>
            configForMutation match {
              case Left(error) => error
              case Right(config) =>
                val stamped =
                  CustomSubnavConfigFunctions.stamp(subnav, request.user)
                persist(
                  CustomSubnavConfigFunctions.upsertDraft(config, stamped)
                )
            }
          case None => BadRequest
        }
    }

  def publishSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        mutate(id)(CustomSubnavConfigFunctions.publish(_, id))
    }

  def discardSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        mutate(id)(CustomSubnavConfigFunctions.discard(_, id))
    }

  def unpublishSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        mutate(id)(CustomSubnavConfigFunctions.unpublish(_, id))
    }

  def deleteSubnav(id: String) =
    (AccessAPIAuthAction andThen new ConfigureSubnavsPermissionCheck(acl)) {
      _ =>
        mutate(id)(CustomSubnavConfigFunctions.delete(_, id))
    }
}
