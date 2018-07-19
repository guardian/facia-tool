package util

import com.gu.permissions.{PermissionDefinition, PermissionsProvider}
import logging.Logging
import play.api.libs.json.{JsBoolean, JsValue, Json, Writes}
import switchboard.SwitchManager

object Authorization {
  implicit val authorizationWrites = new Writes[Authorization] {
    def writes(access: Authorization): JsValue = access match {
      case AccessGranted => JsBoolean(true)
      case AccessDenied => JsBoolean(false)}}
}

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

class Acl(permissions: PermissionsProvider) extends Logging {
  def testUser(permission: PermissionDefinition, switch: String)
              (email: String): Authorization = {

    permissions.hasPermission(permission, email) match {
      case _ if !SwitchManager.getStatus(switch) =>
        AccessGranted

      case true =>
        AccessGranted

      case _ =>
        logger.error(s"Unable to get acl status for ${permission.name} $switch")
        AccessDenied
    }
  }

  def testUserAndCollections(restrictedCollections: Set[String], permission: PermissionDefinition, switch: String)
                            (email: String, collectionIds: Set[String]): Authorization = {
    if ((restrictedCollections intersect collectionIds).nonEmpty)
      testUser(permission, switch)(email)
    else AccessGranted
  }
}
