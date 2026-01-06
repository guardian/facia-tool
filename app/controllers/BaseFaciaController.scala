package controllers

import java.util.Locale
import com.gu.pandomainauth.action.{AuthActions, UserRequest}
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{
  PanDomain,
  PanDomainAuthSettingsRefresher,
  S3BucketLoader
}
import com.gu.permissions.{PermissionsConfig, PermissionsProvider}
import conf.ApplicationConfiguration
import logging.Logging
import permissions._
import play.api.ApplicationLoader.Context
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc._
import play.api.BuiltInComponentsFromContext
import play.filters.cors.CORSComponents
import logging.Logging
import util.Acl

import scala.concurrent.ExecutionContext

abstract class BaseFaciaControllerComponents(context: Context)
    extends BuiltInComponentsFromContext(context)
    with AhcWSComponents
    with AssetsComponents
    with CORSComponents
    with Logging {

  def config: ApplicationConfiguration

  lazy val panDomainSettings: PanDomainAuthSettingsRefresher =
    PanDomainAuthSettingsRefresher(
      domain = config.pandomain.domain,
      system = config.pandomain.service,
      S3BucketLoader.forAwsSdkV1(
        config.aws.s3Client,
        "pan-domain-auth-settings"
      )
    )

  lazy val permissions = PermissionsProvider(
    PermissionsConfig(
      stage = config.environment.stage.toUpperCase(Locale.UK),
      region = config.aws.region,
      awsCredentials = config.aws.cmsFrontsAccountCredentials
    )
  )
}

abstract class BaseFaciaController(deps: BaseFaciaControllerComponents)
    extends BaseController
    with AuthActions
    with Logging {

  final override def wsClient: WSClient = deps.wsClient

  final override def controllerComponents: ControllerComponents =
    deps.controllerComponents

  final def config: ApplicationConfiguration = deps.config

  override def cacheValidation = true

  override def authCallbackUrl: String =
    config.pandomain.host + "/oauthCallback"

  private val accessPermissionCheck = new AccessEditorialFrontsPermissionCheck(
    deps.permissions
  )(deps.executionContext)
  private val editEditionsPermissionCheck = new EditEditionsPermissionCheck(
    deps.permissions
  )(deps.executionContext)

  final def AccessAuthAction = AuthAction andThen accessPermissionCheck
  final def AccessAPIAuthAction = APIAuthAction andThen accessPermissionCheck
  final def EditEditionsAuthAction =
    APIAuthAction andThen editEditionsPermissionCheck

  def getCollectionPermissionFilterByPriority(priority: String, acl: Acl)(
      implicit ec: ExecutionContext
  ): ActionBuilder[UserRequest, AnyContent] = {
    val permissionsPriority =
      PermissionsPriority.stringToPermissionPriority(priority)
    permissionsPriority match {
      case Some(EditorialPermission) =>
        AccessAuthAction andThen new EditEditorialFrontsPermissionCheck(acl)
      case Some(CommercialPermission) =>
        AccessAuthAction andThen new LaunchCommercialFrontsPermissionCheck(acl)
      case Some(EmailPermission) =>
        AccessAuthAction andThen new EditEmailFrontsPermissionCheck(acl)
      case Some(EditionsPermission) =>
        AccessAuthAction andThen new AccessEditionsPermissionCheck(acl)
      case _ => AccessAuthAction
    }
  }

  private def userInGroups(authedUser: AuthenticatedUser): Boolean = {
    deps.permissions.hasPermission(
      Permissions.FrontsAccess,
      authedUser.user.email
    )
  }

  override def validateUser(authedUser: AuthenticatedUser): Boolean =
    PanDomain.guardianValidation(authedUser) && userInGroups(authedUser)

  override lazy val panDomainSettings: PanDomainAuthSettingsRefresher =
    deps.panDomainSettings

  override def showUnauthedMessage(
      message: String
  )(implicit request: RequestHeader): Result = {
    logger.info(message)
    Ok(views.html.auth.login(Some(message)))
  }

  override def invalidUserMessage(claimedAuth: AuthenticatedUser): String = {
    if (
      (claimedAuth.user.emailDomain == "guardian.co.uk") && !claimedAuth.multiFactor
    )
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to have two factor authentication enabled and be granted permission." +
        s" Please contact Central Production by emailing central.production@theguardian.com and request access to The Fronts Tool."
    else if (!userInGroups(claimedAuth))
      s"${claimedAuth.user.email} does not have permission to access the Fronts tool. Please contact Central Production by emailing core.central.production@guardian.co.uk"
    else
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to use your Guardian Google account to login. Please sign in with your Guardian Google account first, then retry logging in."

  }

  val telemetryUrl =
    s"https://user-telemetry.${config.environment.correspondingToolsDomainSuffix}/guardian-tool-accessed?app=facia-tool&stage=${config.environment.stage.toUpperCase()}"
}
