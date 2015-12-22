package controllers

import auth.PanDomainAuthActions
import conf.Configuration
import model.Cached
import permissions.Permissions
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import switchboard.SwitchManager
import util.{Acl, AclJson}

import scala.concurrent.ExecutionContext.Implicits.global


object Defaults {
  implicit val jsonFormat = Json.writes[Defaults]
}

case class Defaults(
  dev: Boolean,
  env: String,
  editions: Seq[String],
  email: String,
  avatarUrl: Option[String],
  sentryPublicDSN: String,
  mediaBaseUrl: String,
  apiBaseUrl: String,
  switches: JsValue,
  acl: AclJson,
  project: String,
  collectionCap: Int
)

object DefaultsController extends Controller with PanDomainAuthActions {
  def configuration = APIAuthAction.async { request =>
    for {
      hasBreakingNews <- Acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(request.user.email)
      hasConfigureFronts <- Acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(request.user.email)
    } yield {
      val acls = AclJson(
        fronts = Map("breaking-news" -> hasBreakingNews),
        permissions = Map("configure-config" -> hasConfigureFronts)
      )

      Cached(60) {
        Ok(Json.toJson(Defaults(
          Play.isDev,
          Configuration.environment.stage,
          Seq("uk", "us", "au"),
          request.user.email,
          request.user.avatarUrl,
          Configuration.sentry.publicDSN,
          Configuration.media.baseUrl.get,
          Configuration.media.apiUrl.get,
          SwitchManager.getSwitchesAsJson(),
          acls,
          Configuration.environment.project,
          Configuration.facia.collectionCap
        )))
      }
    }
  }
}
