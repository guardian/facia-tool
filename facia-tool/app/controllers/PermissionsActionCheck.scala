package controllers

import com.gu.pandomainauth.action.UserRequest
import play.api.Logger
import play.api.mvc._
import permissions._
import services.ConfigAgent
import utils.{Authorization, Acl, AccessGranted, AccessDenied}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.ExecutionContext.Implicits.global

trait PermissionActionFilter extends ActionFilter[UserRequest] {
  val testAccess: String => Future[Authorization]
  val restrictedAction: String

  override def filter[A](request: UserRequest[A]) =
    testAccess(request.user.email).map {
      case AccessGranted => None
      case AccessDenied =>
        Logger.info(s"user not authorized to $restrictedAction")
        Some(Results.Unauthorized(views.html.unauthorized()))}
}

object ConfigPermissionCheck extends PermissionActionFilter {
  val testAccess: String => Future[Authorization] = Acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")
  val restrictedAction = "configure fronts"
}

object BreakingNewsPermissionCheck extends PermissionActionFilter {
  val testAccess: String => Future[Authorization] = Acl.testUser(Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")
  val restrictedAction = "send breaking news alerts"
}

trait BreakingNewsEditCollectionsCheck { self: Controller =>
  private def testAccess(email: String, collections: Set[String]) = Acl.testUserAndCollections(ConfigAgent.getBreakingNewsCollectionIds, Permissions.BreakingNewsAlert, "facia-tool-allow-breaking-news-for-all")(email, collections)

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
