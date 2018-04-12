package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.Metadata
import conf.ApplicationConfiguration
import model.Cached
import permissions.Permissions
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
  collectionCap: Int,
  navListCap: Int,
  navListType: String,
  collectionMetadata: Iterable[Metadata],
  capiLiveUrl: String = "",
  capiPreviewUrl: String = ""
)

class DefaultsController(val config: ApplicationConfiguration, val acl: Acl, val isDev: Boolean) extends Controller with PanDomainAuthActions {
  def configuration = APIAuthAction.async { implicit request =>
    for {
      hasBreakingNews <- acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(request.user.email)
      hasConfigureFronts <- acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(request.user.email)
    } yield {
      val acls = AclJson(
        fronts = Map(config.faciatool.breakingNewsFront -> hasBreakingNews),
        permissions = Map("configure-config" -> hasConfigureFronts)
      )

      Cached(60) {
        Ok(Json.toJson(Defaults(
          isDev,
          config.environment.stage,
          Seq("uk", "us", "au"),
          request.user.email,
          request.user.avatarUrl,
          config.sentry.publicDSN,
          config.media.baseUrl.get,
          config.media.apiUrl,
          SwitchManager.getSwitchesAsJson(),
          acls,
          config.facia.collectionCap,
          config.facia.navListCap,
          config.facia.navListType,
          Metadata.tags.map{
            case (_, meta) => meta
          }
        )))
      }
    }
  }
}
