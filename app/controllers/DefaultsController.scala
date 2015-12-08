package controllers

import auth.PanDomainAuthActions
import conf.Configuration
import model.Cached
import permissions.Permissions
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import slices.{ContainerJsonConfig, DynamicContainers, FixedContainers}
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
  lowFrequency: Int,
  highFrequency: Int,
  standardFrequency: Int,
  sentryPublicDSN: String,
  mediaBaseUrl: String,
  apiBaseUrl: String,
  fixedContainers: Seq[ContainerJsonConfig],
  dynamicContainers: Seq[ContainerJsonConfig],
  switches: JsValue,
  acl: AclJson,
  project: String,
  collectionCap: Int
)

object DefaultsController extends Controller with PanDomainAuthActions {
  private val DynamicGroups = Seq(
    "standard",
    "big",
    "very big",
    "huge"
  )

  private val DynamicPackage = Seq(
    "standard",
    "snap"
  )

  private val DynamicMpu = Seq(
    "standard",
    "big"
  )


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
          60,
          1,
          5,
          Configuration.sentry.publicDSN,
          Configuration.media.baseUrl.get,
          Configuration.media.apiUrl.get,
          FixedContainers.all.keys.toSeq.map(id => ContainerJsonConfig(id, None)),
          DynamicContainers.all.keys.toSeq.map(id =>
            if (id == "dynamic/package") {
              ContainerJsonConfig(id, Some(DynamicPackage))
            } else if (id == "dynamic/slow-mpu") {
              ContainerJsonConfig(id, Some(DynamicMpu))
            } else {
              ContainerJsonConfig(id, Some(DynamicGroups))
            }
          ),
          SwitchManager.getSwitchesAsJson(),
          acls,
          Configuration.environment.project,
          Configuration.facia.collectionCap
        )))
      }

    }

  }
}
