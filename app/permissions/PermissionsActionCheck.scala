package permissions

import com.gu.pandomainauth.action.UserRequest
import controllers.BaseFaciaController
import play.api.Logger
import play.api.mvc._
import services.ConfigAgent
import util.{AccessDenied, AccessGranted, Acl, Authorization}

import scala.concurrent.{ExecutionContext, Future}

trait PermissionActionFilter extends ActionFilter[UserRequest] {

  implicit lazy val executionContext: ExecutionContext = ExecutionContext.Implicits.global

  val testAccess: String => Future[Authorization]
  val restrictedAction: String

  override def filter[A](request: UserRequest[A]) =
    testAccess(request.user.email).map {
      case AccessGranted => None
      case AccessDenied =>
        Logger.info(s"user not authorized to $restrictedAction")
        Some(Results.Unauthorized(views.html.unauthorized()))}
}

class ConfigPermissionCheck(val acl: Acl) extends PermissionActionFilter {
  val testAccess: String => Future[Authorization] = acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")
  val restrictedAction = "configure fronts"
}

class BreakingNewsPermissionCheck(val acl: Acl) extends PermissionActionFilter {
  val testAccess: String => Future[Authorization] = acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")
  val restrictedAction = "send breaking news alerts"
}

trait BreakingNewsEditCollectionsCheck { self: BaseFaciaController =>
  def acl: Acl
  def configAgent: ConfigAgent

  private def testAccess(email: String, collections: Set[String]) = acl.testUserAndCollections(configAgent.getBreakingNewsCollectionIds, Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(email, collections)

  def withModifyPermissionForCollections[A](collectionIds: Set[String])(block: => Future[Result])
    (implicit request: UserRequest[A],
              executionContext: ExecutionContext): Future[Result] = {

    testAccess(request.user.email, collectionIds).flatMap {
      case AccessGranted => block
      case AccessDenied =>
        Logger.info("user not authorized to send breaking news alerts")
        Future.successful(Results.Unauthorized)}
  }
}
