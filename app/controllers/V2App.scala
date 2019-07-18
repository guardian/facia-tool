package controllers

import com.gu.scanamo._
import com.gu.scanamo.syntax._
import model.{FeatureSwitch, UserData, UserDataForDefaults}

import scala.concurrent.ExecutionContext
import com.gu.facia.client.models.Metadata
import permissions.Permissions
import play.api.libs.json.Json
import switchboard.SwitchManager
import util.{Acl, AclJson}
import services.Dynamo

class V2App(isDev: Boolean, val acl: Acl, dynamo: Dynamo, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  import model.UserData._

  def index(priority: String = "", frontId: String = "") = getCollectionPermissionFilterByPriority(priority, acl)(ec) { implicit req =>

    val editingEdition = priority.startsWith("issues")
    val userDataTable = Table[UserData](config.faciatool.userDataTable)

    val jsFileName = "dist/app.bundle.js"
    val faviconDirectoryName = "favicon/"

    val jsLocation: String = routes.V2Assets.at(jsFileName).toString
    val faviconLocation: String = routes.V2Assets.at(faviconDirectoryName).toString

    val hasBreakingNews = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(req.user.email)
    val hasConfigureFronts = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(req.user.email)

    val acls = AclJson(
      fronts = Map(config.faciatool.breakingNewsFront -> hasBreakingNews),
      permissions = Map("configure-config" -> hasConfigureFronts)
    )

    val userEmail: String = req.user.email

    val maybeUserData: Option[UserData] = Scanamo.exec(dynamo.client)(
      userDataTable.get('email -> userEmail)).flatMap(_.right.toOption)

    val clipboardArticles = if (editingEdition)
      maybeUserData.map(_.editionsClipboardArticles.getOrElse(List()))
    else
      maybeUserData.map(_.clipboardArticles.getOrElse(List()))

    val maybeUserDataForDefaults = maybeUserData.map { data => UserDataForDefaults.fromUserData(data, clipboardArticles) }

    val conf = Defaults(
      isDev,
      config.environment.stage,
      Seq("uk", "us", "au"),
      userEmail,
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
      maybeUserDataForDefaults,
      routes.FaciaContentApiProxy.capiLive("").absoluteURL(true),
      routes.FaciaContentApiProxy.capiPreview("").absoluteURL(true)
    )

    Ok(views.html.V2App.app(
      "Fronts Tool",
      jsLocation,
      faviconLocation,
      Json.toJson(conf).toString()
    ))
  }

}
