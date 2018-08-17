package permissions

import com.gu.pandomainauth.action.UserRequest
import com.gu.permissions.PermissionsProvider
import controllers.BaseFaciaController
import play.api.mvc._
import services.ConfigAgent
import util.{AccessDenied, AccessGranted, Acl, Authorization}
import logging.Logging
import switchboard.SwitchManager

import scala.concurrent.{ExecutionContext, Future}

trait PermissionActionFilter extends ActionFilter[UserRequest] with Logging {

  implicit val executionContext: ExecutionContext
  val testAccess: String => Authorization
  val restrictedAction: String


  override def filter[A](request: UserRequest[A]): Future[Option[Result]] = Future.successful {
    testAccess(request.user.email) match {
      case AccessGranted => None
      case AccessDenied =>
        logger.info(s"User with e-mail ${request.user.email} not authorized to $restrictedAction")
        Some(Results.Unauthorized(views.html.unauthorized()))
    }
  }
}

class LaunchCommercialFrontsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(Permissions.LaunchCommercialFrontsAlert, "facia-tool-allow-access-for-all")
  override val restrictedAction: String = "Launch commercial fronts."
}

class LaunchEditorialFrontsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(Permissions.LaunchEditorialFrontsAlert, "facia-tool-allow-access-for-all")
  override val restrictedAction: String = "Launch editorial fronts."
}

class EditEditorialFrontsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(Permissions.EditEditorialFrontsAlert, "facia-tool-allow-access-for-all")
  override val restrictedAction: String = "Edit editorial fronts."
}

class AccessPermissionCheck(client: PermissionsProvider)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  val executionContext = ec
  val restrictedAction = "access fronts"
  val testAccess: String => Authorization = (email: String) => {
    val switchEnabled = SwitchManager.getStatus("facia-tool-permissions-access")
    val hasPermission = client.hasPermission(Permissions.FrontsAccess, email)

    if(switchEnabled) {
      if(hasPermission) { AccessGranted } else { AccessDenied }
    } else {
      AccessGranted
    }
  }
}

class ConfigPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  val executionContext = ec
  val testAccess: String => Authorization = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")
  val restrictedAction = "configure fronts"
}

class BreakingNewsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext) extends PermissionActionFilter {
  val executionContext = ec
  val testAccess: String => Authorization = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")
  val restrictedAction = "send breaking news alerts"
}

trait BreakingNewsEditCollectionsCheck extends Logging { self: BaseFaciaController =>
  def acl: Acl
  def configAgent: ConfigAgent

  private def testAccess(email: String, collections: Set[String]) = {
    acl.testUserAndCollections(configAgent.getBreakingNewsCollectionIds, Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(email, collections)
  }

  def withModifyPermissionForCollections[A](collectionIds: Set[String])(block: => Future[Result])
    (implicit request: UserRequest[A],
              executionContext: ExecutionContext): Future[Result] = {

    testAccess(request.user.email, collectionIds) match {
      case AccessGranted => block
      case AccessDenied =>
        logger.info(s"User with e-mail ${request.user.email} not authorized to send breaking news alerts")
        Future.successful(Results.Unauthorized)}
  }
}
