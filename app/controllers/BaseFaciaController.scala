package controllers

import java.util.Locale

import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{PanDomain, PanDomainAuthSettingsRefresher}
import com.gu.permissions.{PermissionsConfig, PermissionsProvider}
import conf.ApplicationConfiguration
import permissions.{AccessPermissionCheck, Permissions}
import play.api.ApplicationLoader.Context
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.{BaseController, ControllerComponents, RequestHeader, Result}
import play.api.{BuiltInComponentsFromContext, Logger}
import play.filters.cors.CORSComponents

abstract class BaseFaciaControllerComponents(context: Context) extends BuiltInComponentsFromContext(context) with AhcWSComponents with AssetsComponents with CORSComponents {

  def config: ApplicationConfiguration

  lazy val panDomainSettings: PanDomainAuthSettingsRefresher =
    new PanDomainAuthSettingsRefresher(config.pandomain.domain, config.pandomain.service, actorSystem, config.aws.cmsFrontsAccountCredentials)

  lazy val permissions = PermissionsProvider(PermissionsConfig(
    stage = config.environment.stage.toUpperCase(Locale.UK),
    region = config.aws.region,
    awsCredentials = config.aws.cmsFrontsAccountCredentials
  ))
}

abstract class BaseFaciaController(deps: BaseFaciaControllerComponents) extends BaseController with AuthActions {

  final override def wsClient: WSClient = deps.wsClient

  final override def controllerComponents: ControllerComponents = deps.controllerComponents

  final def config: ApplicationConfiguration = deps.config

  override def cacheValidation = true

  override def authCallbackUrl: String = config.pandomain.host  + "/oauthCallback"

  private val accessPermissionCheck = new AccessPermissionCheck(deps.permissions)(deps.executionContext)
  final def AccessAuthAction = AuthAction andThen accessPermissionCheck
  final def AccessAPIAuthAction = APIAuthAction andThen accessPermissionCheck

  private def userHasAccess(authedUser: AuthenticatedUser): Boolean = {
    deps.permissions.hasPermission(Permissions.FrontsAccess, authedUser.user.email)
  }

  override def validateUser(authedUser: AuthenticatedUser): Boolean = PanDomain.guardianValidation(authedUser) && userHasAccess(authedUser)

  override lazy val panDomainSettings: PanDomainAuthSettingsRefresher = deps.panDomainSettings

  override def showUnauthedMessage(message: String)(implicit request: RequestHeader): Result = {
    Logger.info(message)
    Ok(views.html.auth.login(Some(message)))
  }

  override def invalidUserMessage(claimedAuth: AuthenticatedUser): String = {
    if( (claimedAuth.user.emailDomain == "guardian.co.uk") && !claimedAuth.multiFactor)
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to have two factor authentication enabled and be granted permission." +
        s" Please contact Central Production by emailing core.central.production@guardian.co.uk and request access to The Fronts Tool."
    else if (!userHasAccess(claimedAuth)) s"${claimedAuth.user.email} does not have permission to access the Fronts tool. Please contact Central Production by emailing core.central.production@guardian.co.uk"

    else s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to use your Guardian Google account to login. Please sign in with your Guardian Google account first, then retry logging in."

  }
}
