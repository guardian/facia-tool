package permissions

import com.gu.pandomainauth.action.UserRequest
import com.gu.permissions.{PermissionDefinition, PermissionsProvider}
import controllers.BaseFaciaController
import play.api.mvc._
import services.ConfigAgent
import util.{AccessDenied, AccessGranted, Acl, Authorization}
import logging.Logging

import scala.concurrent.{ExecutionContext, Future}

trait PermissionActionFilter extends ActionFilter[UserRequest] with Logging {

  implicit val executionContext: ExecutionContext
  val testAccess: String => Authorization
  val restrictedAction: String

  def testUserPermission(
      client: PermissionsProvider,
      permission: PermissionDefinition
  ) = { (email: String) =>
    {
      val hasPermission = client.hasPermission(permission, email)
      if (hasPermission) {
        AccessGranted
      } else {
        AccessDenied
      }
    }
  }

  override def filter[A](request: UserRequest[A]): Future[Option[Result]] =
    Future.successful {
      testAccess(request.user.email) match {
        case AccessGranted => None
        case AccessDenied =>
          logger.info(
            s"User with e-mail ${request.user.email} not authorized to $restrictedAction"
          )
          Some(Results.Unauthorized(views.html.unauthorized()))
      }
    }
}
trait ModifyCollectionsPermissionsCheck extends Logging {
  self: BaseFaciaController =>

  def acl: Acl
  def configAgent: ConfigAgent

  private def testAccess(
      email: String,
      priorities: Set[PermissionsPriority],
      isLaunch: Boolean
  ) = {

    if (priorities.isEmpty) AccessGranted
    else if (isLaunch)
      acl.testUserGroupsAndCollections(
        Permissions.LaunchEditorialFronts,
        Permissions.LaunchCommercialFronts,
        Permissions.FrontsAccess,
        Permissions.LaunchAndEditEmailFronts,
        "facia-tool-allow-launch-editorial-fronts-for-all"
      )(email, priorities)
    else
      acl.testUserGroupsAndCollections(
        Permissions.EditEditorialFronts,
        Permissions.LaunchCommercialFronts,
        Permissions.FrontsAccess,
        Permissions.LaunchAndEditEmailFronts,
        "facia-tool-allow-edit-editorial-fronts-for-all"
      )(email, priorities)
  }

  def withModifyGroupPermissionForCollections[A](
      priorities: Set[PermissionsPriority],
      secondaryPriorities: Set[PermissionsPriority],
      isLaunch: Boolean = false
  )(block: => Future[Result])(implicit
      request: UserRequest[A],
      executionContext: ExecutionContext
  ): Future[Result] = {
    (
      testAccess(request.user.email, priorities, isLaunch),
      testAccess(request.user.email, secondaryPriorities, isLaunch)
    ) match {
      case (AccessGranted, AccessGranted) => block
      case _ => Future.successful(Results.Unauthorized)
    }
  }
}

class LaunchCommercialFrontsPermissionCheck(val acl: Acl)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(
    Permissions.LaunchCommercialFronts,
    "facia-tool-allow-launch-commercial-fronts-for-all"
  )
  override val restrictedAction: String = "Launch commercial fronts."
}

class LaunchEditorialFrontsPermissionCheck(val acl: Acl)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(
    Permissions.LaunchEditorialFronts,
    "facia-tool-allow-launch-editorial-fronts-for-all"
  )
  override val restrictedAction: String = "Launch editorial fronts."
}

class EditEditorialFrontsPermissionCheck(val acl: Acl)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(
    Permissions.EditEditorialFronts,
    "facia-tool-allow-edit-editorial-fronts-for-all"
  )
  override val restrictedAction: String = "Edit editorial fronts."
}

class EditEmailFrontsPermissionCheck(val acl: Acl)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = (email: String) => {
    val emailAccess = acl.testUser(
      Permissions.LaunchAndEditEmailFronts,
      "facia-tool-allow-edit-email-fronts-for-all"
    )(email)
    emailAccess match {
      case AccessGranted => emailAccess
      case AccessDenied =>
        new EditEditorialFrontsPermissionCheck(acl)(executionContext)
          .testAccess(email)
    }
  }
  override val restrictedAction: String = "Edit email fronts."
}

class AccessEditionsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext)
    extends PermissionActionFilter {
  override implicit val executionContext: ExecutionContext = ec
  override val testAccess: String => Authorization = acl.testUser(
    Permissions.EditEditorialFronts,
    "facia-tool-allow-edit-editorial-fronts-for-all"
  )
  override val restrictedAction: String = "Edit editions fronts."
}

class AccessEditorialFrontsPermissionCheck(client: PermissionsProvider)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  val executionContext = ec
  val restrictedAction = "access editorial fronts"
  val testAccess: String => Authorization =
    testUserPermission(client, Permissions.FrontsAccess)
}

class EditEditionsPermissionCheck(client: PermissionsProvider)(implicit
    ec: ExecutionContext
) extends PermissionActionFilter {
  val executionContext = ec
  val restrictedAction = "edit editions"
  val testAccess: String => Authorization =
    testUserPermission(client, Permissions.EditEditions)
}

class ConfigPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext)
    extends PermissionActionFilter {
  val executionContext = ec
  val testAccess: String => Authorization =
    acl.testUser(Permissions.ConfigureFronts, "facia-tool-allow-config-for-all")
  val restrictedAction = "configure fronts"
}

class BreakingNewsPermissionCheck(val acl: Acl)(implicit ec: ExecutionContext)
    extends PermissionActionFilter {
  val executionContext = ec
  val testAccess: String => Authorization = acl.testUser(
    Permissions.BreakingNewsAlert,
    "facia-tool-allow-breaking-news-for-all"
  )
  val restrictedAction = "send breaking news alerts"
}

trait BreakingNewsEditCollectionsCheck extends Logging {
  self: BaseFaciaController =>
  def acl: Acl
  def configAgent: ConfigAgent

  private def testAccess(email: String, collections: Set[String]) = {
    acl.testUserAndCollections(
      configAgent.getBreakingNewsCollectionIds,
      Permissions.BreakingNewsAlert,
      "facia-tool-allow-breaking-news-for-all"
    )(email, collections)
  }

  def withModifyPermissionForCollections[A](
      collectionIds: Set[String]
  )(block: => Future[Result])(implicit
      request: UserRequest[A],
      executionContext: ExecutionContext
  ): Future[Result] = {

    testAccess(request.user.email, collectionIds) match {
      case AccessGranted => block
      case AccessDenied =>
        logger.info(
          s"User with e-mail ${request.user.email} not authorized to send breaking news alerts"
        )
        Future.successful(Results.Unauthorized)
    }
  }
}
