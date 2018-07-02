package controllers

import com.gu.editorial.permissions.client.PermissionGranted
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{PanDomain, PanDomainAuthSettingsRefresher}
import conf.ApplicationConfiguration
import permissions.Permissions
import play.api.ApplicationLoader.Context
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSComponents
import play.api.mvc.{BaseController, ControllerComponents, RequestHeader, Result}
import play.api.{BuiltInComponentsFromContext, Logger}
import play.filters.cors.CORSComponents
import switchboard.SwitchManager

import scala.concurrent.Await
import scala.concurrent.duration.Duration

abstract class BaseFaciaControllerComponents(context: Context) extends BuiltInComponentsFromContext(context) with AhcWSComponents with AssetsComponents with CORSComponents {

  def config: ApplicationConfiguration

  lazy val panDomainSettings: PanDomainAuthSettingsRefresher =
    new PanDomainAuthSettingsRefresher(config.pandomain.domain, config.pandomain.service, actorSystem, config.aws.cmsFrontsAccountCredentials)

  lazy val permissions = new Permissions(config)
}

abstract class BaseFaciaController(deps: BaseFaciaControllerComponents) extends BaseController with AuthActions {

  final override def wsClient: WSClient = deps.wsClient

  final override def controllerComponents: ControllerComponents = deps.controllerComponents

  final def config: ApplicationConfiguration = deps.config

  override def cacheValidation = true

  override def authCallbackUrl: String = config.pandomain.host  + "/oauthCallback"

  private def userInGroups(authedUser: AuthenticatedUser): Boolean = {
    if(SwitchManager.getStatus("permissions_access")) {
      // TODO MRB: avoid await with new permissions library
      Await.result(deps.permissions.get(Permissions.FrontsAccess), Duration.Inf) == PermissionGranted
    } else {
      groupChecker.exists(checker =>
        checker.checkGroups(authedUser, config.pandomain.userGroups).fold(
          error => {
            Logger.warn(error)
            false
          }, identity)
      )
    }
  }

  override def validateUser(authedUser: AuthenticatedUser): Boolean = PanDomain.guardianValidation(authedUser) && userInGroups(authedUser)

  override lazy val panDomainSettings: PanDomainAuthSettingsRefresher = deps.panDomainSettings

  override def showUnauthedMessage(message: String)(implicit request: RequestHeader): Result = {
    Logger.info(message)
    Ok(views.html.auth.login(Some(message)))
  }

  override def invalidUserMessage(claimedAuth: AuthenticatedUser): String = {
    if( (claimedAuth.user.emailDomain == "guardian.co.uk") && !claimedAuth.multiFactor)
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool as you need to have two factor authentication enabled." +
        s" Please contact Central Production by emailing core.central.production@guardian.co.uk and request access to The Fronts Tool."
    else if (!userInGroups(claimedAuth)) s"${claimedAuth.user.email} does not have permission to access the Fronts tool. Please contact Central Production by emailing core.central.production@guardian.co.uk"

    else s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to use your Guardian Google account to login. Please sign in with your Guardian Google account first, then retry logging in."

  }
}
