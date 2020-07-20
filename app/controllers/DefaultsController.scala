package controllers

import com.gu.facia.client.models.{Metadata, TargetedTerritory, Trail}
import model.editions.EditionsTemplates
import model.editions.templates.EditionDefinition
import model.{Cached, FeatureSwitch, UserDataForDefaults}
import permissions.Permissions
import play.api.libs.json.{JsValue, Json}
import switchboard.SwitchManager
import util.{Acl, AclJson}

object Defaults {
  implicit val jsonFormat = Json.writes[Defaults]
}

case class Defaults(
                     dev: Boolean,
                     env: String,
                     editions: Seq[String],
                     email: String,
                     avatarUrl: Option[String],
                     firstName: String,
                     lastName: String,
                     sentryPublicDSN: String,
                     mediaBaseUrl: String,
                     apiBaseUrl: String,
                     switches: JsValue,
                     acl: AclJson,
                     collectionCap: Int,
                     navListCap: Int,
                     navListType: String,
                     collectionMetadata: Iterable[Metadata],
                     userData: Option[UserDataForDefaults],
                     capiLiveUrl: String = "",
                     capiPreviewUrl: String = "",
                     availableTerritories: Iterable[TargetedTerritory] = Nil,
                     availableEditions: List[EditionDefinition]
)

class DefaultsController(val acl: Acl, val isDev: Boolean, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def configuration = AccessAPIAuthAction { implicit request =>
    val hasBreakingNews = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(request.user.email)
    val hasConfigureFronts = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")(request.user.email)

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
        request.user.firstName,
        request.user.lastName,
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
        },
        None,
        availableTerritories = TargetedTerritory.allTerritories,
        availableEditions = EditionsTemplates.getAvailableEditions
      )))
    }
  }
}
