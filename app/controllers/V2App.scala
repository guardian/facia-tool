package controllers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import org.scanamo._
import org.scanamo.syntax._
import model.{FeatureSwitch, UserData, UserDataForDefaults}

import scala.concurrent.ExecutionContext
import com.gu.facia.client.models.{Metadata, TargetedTerritory}
import model.editions.{EditionsAppTemplates, FeastAppTemplates}
import permissions.Permissions
import play.api.libs.json.Json
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import switchboard.SwitchManager
import util.{Acl, AclJson}

class V2App(isDev: Boolean, val acl: Acl, dynamoClient: DynamoDbClient, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  import model.UserData._

  def index(priority: String = "", frontId: String = "") = getCollectionPermissionFilterByPriority(priority, acl)(ec) { implicit req =>

    val editingEdition = priority.startsWith("issues")
    import org.scanamo.generic.auto._
    val userDataTable = Table[UserData](config.faciatool.userDataTable)

    val jsFileName = "dist/index.js"
    val cssFileName = "dist/index.css"
    val faviconDirectoryName = "favicon/"

    val jsLocation: String = routes.V2Assets.at(jsFileName).toString
    val cssLocation: String = routes.V2Assets.at(cssFileName).toString
    val faviconLocation: String = routes.V2Assets.at(faviconDirectoryName).toString

    val hasBreakingNews = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(req.user.email)
    val hasConfigureFronts = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(req.user.email)
    val hasEditionsPermissions = acl.testUser(Permissions.EditEditions, "facia-tool-allow-edit-editions-for-all")(req.user.email)

    val acls = AclJson(
      fronts = Map(config.faciatool.breakingNewsFront -> hasBreakingNews),
      editions = Map(config.faciatool.canEditEditions -> hasEditionsPermissions),
      permissions = Map("configure-config" -> hasConfigureFronts)
    )

    val userEmail: String = req.user.email

    val maybeUserData: Option[UserData] = Scanamo(dynamoClient).exec(
      userDataTable.get("email" === userEmail)).flatMap(_.toOption)

    val clipboardArticles = if (editingEdition)
      maybeUserData.map(_.editionsClipboardArticles.getOrElse(List()))
    else
      maybeUserData.map(_.clipboardArticles.getOrElse(List()))

    val userDataForDefaults = UserDataForDefaults.fromUserData(
      maybeUserData.getOrElse(UserData(userEmail)),
      clipboardArticles
    )

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
      Some(userDataForDefaults),
      routes.FaciaContentApiProxy.capiLive("").absoluteURL(true),
      routes.FaciaContentApiProxy.capiPreview("").absoluteURL(true),
      TargetedTerritory.allTerritories,
      EditionsAppTemplates.getAvailableTemplates ++ FeastAppTemplates.getAvailableTemplates
    )

    Ok(views.html.V2App.app(
      "Fronts Tool",
      jsLocation,
      cssLocation,
      faviconLocation,
      Json.toJson(conf).toString(),
      isDev
    ))
  }

}
