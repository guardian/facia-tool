package util

import com.gu.editorial.permissions.client.{Permission, PermissionDenied, PermissionGranted, PermissionsUser}
import permissions.Permissions
import play.api.Logger
import play.api.libs.json.{JsBoolean, JsValue, Json, Writes}
import switchboard.SwitchManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Authorization {
  implicit val authorizationWrites = new Writes[Authorization] {
    def writes(access: Authorization): JsValue = access match {
      case AccessGranted => JsBoolean(true)
      case AccessDenied => JsBoolean(false)}}}

sealed trait Authorization
object AccessGranted extends Authorization
object AccessDenied extends Authorization

object AclJson {
  implicit val jsonWrites = Json.writes[AclJson]
}

case class AclJson (
  fronts: Map[String, Authorization],
  permissions: Map[String, Authorization]
)

class Acl(permissions: Permissions) {
  def testUser(permission: Permission, switch: String)
              (email: String): Future[Authorization] = {
    implicit val permissionsUser: PermissionsUser = PermissionsUser(email)
    val f = if (!SwitchManager.getStatus(switch)) {
      permissions.get(permission).map {
        case PermissionGranted => AccessGranted
        case PermissionDenied => AccessDenied
      }}
    else Future.successful(AccessGranted)

    f.failed.foreach{case t => Logger.error(s"Unable to get acl status for ${permission.name} $switch", t)}
    f
  }

  def testUserAndCollections(restrictedCollections: Set[String], permission: Permission, switch: String)
                            (email: String, collectionIds: Set[String]): Future[Authorization] = {
    if ((restrictedCollections intersect collectionIds).nonEmpty)
      testUser(permission, switch)(email)
    else Future.successful(AccessGranted)
  }
}
