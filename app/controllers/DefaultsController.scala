package controllers

import com.gu.facia.client.models.{Metadata, TargetedTerritory}
import model.editions.{EditionsAppTemplates, FeastAppTemplates}
import model.editions.templates.CuratedPlatformDefinition
import model.{Cached, UserDataForDefaults}
import permissions.Permissions
import play.api.libs.json.{JsValue, Json, OWrites}
import switchboard.SwitchManager
import util.{Acl, AclJson}

object Defaults {
  implicit val jsonFormat: OWrites[Defaults] = Json.writes[Defaults]
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
    availableTemplates: List[CuratedPlatformDefinition]
)

class DefaultsController(
    val acl: Acl,
    val isDev: Boolean,
    val deps: BaseFaciaControllerComponents
) extends BaseFaciaController(deps) {
  def configuration = AccessAPIAuthAction { implicit request =>
    val hasBreakingNews = acl.testUser(
      Permissions.BreakingNewsAlert,
      "facia-tool-allow-breaking-news-for-all"
    )(request.user.email)
    val hasConfigureFronts = acl.testUser(
      Permissions.ConfigureFronts,
      "facia-tool-allow-config-for-all"
    )(request.user.email)
    val hasEditionsPermissions = acl.testUser(
      Permissions.EditEditions,
      "facia-tool-allow-edit-editorial-fronts-for-all"
    )(request.user.email)

    val acls = AclJson(
      fronts = Map(config.faciatool.breakingNewsFront -> hasBreakingNews),
      editions =
        Map(config.faciatool.canEditEditions -> hasEditionsPermissions),
      permissions = Map("configure-config" -> hasConfigureFronts)
    )

    Cached(60) {
      Ok(
        Json.toJson(
          Defaults(
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
            Metadata.tags.map { case (_, meta) =>
              meta
            },
            None,
            availableTerritories = TargetedTerritory.allTerritories,
            availableTemplates =
              EditionsAppTemplates.getAvailableTemplates ++ FeastAppTemplates.getAvailableTemplates
          )
        )
      )
    }
  }
}
