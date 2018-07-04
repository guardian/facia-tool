package controllers

import scala.concurrent.ExecutionContext
import com.gu.facia.client.models.Metadata
import permissions.Permissions
import play.api.libs.json.Json
import switchboard.SwitchManager
import util.{Acl, AclJson}

class V2App(isDev: Boolean, val acl: Acl, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  def index(priority: String = "", frontId: String = "") = APIAuthAction { implicit req =>

    val jsFileName = "dist/app.bundle.js"

    val jsLocation: String = routes.V2Assets.at(jsFileName).toString

    val hasBreakingNews = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(req.user.email)
    val hasConfigureFronts = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(req.user.email)

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
      req.user.firstName,
      req.user.lastName,
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
      },
      routes.FaciaContentApiProxy.capiLive("").absoluteURL(true),
      routes.FaciaContentApiProxy.capiPreview("").absoluteURL(true)
    )

    Ok(views.html.V2App.app(
      "Fronts Tool",
      jsLocation,
      Json.toJson(conf).toString()
    ))
  }

}
