package auth

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth.{AWSCredentialsProviderChain, STSAssumeRoleSessionCredentialsProvider}
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.service.GoogleGroupChecker
import com.gu.pandomainauth.{PanDomain, PanDomainAuth}
import conf.ApplicationConfiguration
import play.api.Logger
import play.api.mvc._

trait PanDomainAuthActions extends AuthActions with PanDomainAuth with Results {
  def config: ApplicationConfiguration

  private lazy val groupChecker = settings.google2FAGroupSettings.map(new GoogleGroupChecker(_, this.bucket))

  def userInGroups(authedUser: AuthenticatedUser): Boolean = {
    Logger.warn(s"Multifactor checks have been temporarily disabled. User: ${authedUser.user.email}")
    true

//    groupChecker.exists{ checker =>
//      checker.checkGroups(authedUser, config.pandomain.userGroups).fold(
//        error => {
//          Logger.warn(error)
//          false
//        }, identity)
//    }
  }

  override def validateUser(authedUser: AuthenticatedUser): Boolean = {
    PanDomain.guardianValidation(authedUser) && userInGroups(authedUser)
  }

  override def cacheValidation = true

  override def authCallbackUrl: String = config.pandomain.host  + "/oauthCallback"

  override def showUnauthedMessage(message: String)(implicit request: RequestHeader): Result = {
    Logger.info(message)
    Ok(views.html.auth.login(Some(message)))
  }

  override def invalidUserMessage(claimedAuth: AuthenticatedUser): String = {
    if( (claimedAuth.user.emailDomain == "guardian.co.uk") && !claimedAuth.multiFactor)
      s"${claimedAuth.user.email} is not valid for use with the Fronts Tool as you need to have two factor authentication enabled." +
       s" Please contact the Helpdesk by emailing 34444@theguardian.com or calling 34444 and request access to Composer CMS tools."
    else if (!userInGroups(claimedAuth)) s"${claimedAuth.user.email} is not a member of required google groups. Please contact the Helpdesk by emailing 34444@theguardian.com"

    else s"${claimedAuth.user.email} is not valid for use with the Fronts Tool. You need to use your Guardian Google account to login. Please sign in with your Guardian Google account first, then retry logging in."

  }

  override lazy val domain: String = config.pandomain.domain
  override lazy val system: String = config.pandomain.service
  override def awsCredentialsProvider = new AWSCredentialsProviderChain(
    new ProfileCredentialsProvider("workflow"),
    new STSAssumeRoleSessionCredentialsProvider.Builder(config.pandomain.roleArn, config.pandomain.service).build()
  )
}
