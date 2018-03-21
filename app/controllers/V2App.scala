package controllers

import auth.PanDomainAuthActions
import com.gu.facia.client.models.Metadata
import conf.ApplicationConfiguration
import permissions.Permissions
import play.api.libs.json.Json
import play.api.mvc.Controller
import switchboard.SwitchManager
import util.{AclJson, Acl}
import scala.concurrent.ExecutionContext.Implicits.global

class V2App(val config: ApplicationConfiguration, isDev: Boolean, val acl: Acl) extends Controller with PanDomainAuthActions {

  def index(priority: String = "", frontId: String = "") = APIAuthAction.async { req =>

    val jsFileName = "dist/app.bundle.js"

    val jsLocation: String = routes.V2Assets.at(jsFileName).toString

    for {
      hasBreakingNews <- acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(req.user.email)
      hasConfigureFronts <- acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(req.user.email)
    } yield {
      val acls = AclJson(
        fronts = Map(config.faciatool.breakingNewsFront -> hasBreakingNews),
        permissions = Map("configure-config" -> hasConfigureFronts)
      )

      val conf = Defaults(
        isDev,
        config.environment.stage,
        Seq("uk", "us", "au"),
        req.user.email,
        req.user.avatarUrl,
        config.sentry.publicDSN,
        config.media.baseUrl.get,
        config.media.apiUrl,
        SwitchManager.getSwitchesAsJson(),
        acls,
        config.facia.collectionCap,
        config.facia.navListCap,
        config.facia.navListType,
        Metadata.tags.map {
          case (_, meta) => meta
        }
      )

      Ok(views.html.V2App.app(
        "Fronts Tool",
        jsLocation,
        Json.toJson(conf).toString()
      ))
    }
  }

}
