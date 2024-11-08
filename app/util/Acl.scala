package util

import com.gu.permissions.{PermissionDefinition, PermissionsProvider}
import logging.Logging
import permissions._
import play.api.libs.json.{JsBoolean, JsValue, Json, OWrites, Writes}
import switchboard.SwitchManager

object Authorization {
  implicit val authorizationWrites: Writes[Authorization] =
    new Writes[Authorization] {
      def writes(access: Authorization): JsValue = access match {
        case AccessGranted => JsBoolean(true)
        case AccessDenied  => JsBoolean(false)
      }
    }
}

sealed trait Authorization
object AccessGranted extends Authorization
object AccessDenied extends Authorization

object AclJson {
  implicit val jsonWrites: OWrites[AclJson] = Json.writes[AclJson]
}

case class AclJson(
    fronts: Map[String, Authorization],
    editions: Map[String, Authorization],
    permissions: Map[String, Authorization]
)

class Acl(permissions: PermissionsProvider) extends Logging {
  def testUser(permission: PermissionDefinition, switch: String)(
      email: String
  ): Authorization = {

    permissions.hasPermission(permission, email) match {
      case _ if SwitchManager.getStatus(switch) =>
        AccessGranted

      case true =>
        AccessGranted

      case false =>
        AccessDenied
    }
  }

  def testUserAndCollections(
      restrictedCollections: Set[String],
      permission: PermissionDefinition,
      switch: String
  )(email: String, collectionIds: Set[String]): Authorization = {
    if ((restrictedCollections intersect collectionIds).nonEmpty)
      testUser(permission, switch)(email)
    else AccessGranted
  }

  def testUserGroupsAndCollections(
      editorialPermission: PermissionDefinition,
      commercialPermission: PermissionDefinition,
      trainingPermission: PermissionDefinition,
      emailPermission: PermissionDefinition,
      editorialSwitch: String
  )(email: String, priorities: Set[PermissionsPriority]): Authorization = {

    val hasCommercialPermissions = testUser(
      commercialPermission,
      "facia-tool-allow-launch-commercial-fronts-for-all"
    )(email)
    val hasEditorialPermissions =
      testUser(editorialPermission, editorialSwitch)(email)
    val hasTrainingPermissions =
      testUser(trainingPermission, "facia-tool-permissions-access")(email)
    val hasEmailPermissions =
      testUser(emailPermission, "facia-tool-email-access")(email)

    PermissionsChecker.check(
      hasCommercialPermissions,
      hasEditorialPermissions,
      hasTrainingPermissions,
      hasEmailPermissions,
      priorities
    ) match {
      case AccessGranted => AccessGranted
      case AccessDenied => {
        logger.warn(
          s"User with e-mail ${email} and with the following permissions commercial: $hasCommercialPermissions, " +
            s"editorial: $hasEditorialPermissions and training: $hasTrainingPermissions is not authorized to modify " +
            s"collection with priorities " +
            s"$priorities"
        )
        AccessDenied
      }
    }
  }
}

object PermissionsChecker {

  def check(
      hasCommercialPermissions: Authorization,
      hasEditorialPermissions: Authorization,
      hasTrainingPermissions: Authorization,
      hasEmailPermissions: Authorization,
      priorities: Set[PermissionsPriority]
  ): Authorization = {

    val trainingPermissionIsValid = priorities.contains(TrainingPermission)
    val editorialPermissionIsValid = priorities.contains(
      EditorialPermission
    ) || priorities.contains(EmailPermission)
    val commercialPermissionIsValid = priorities.contains(CommercialPermission)
    val emailPermissionIsValid = priorities.contains(EmailPermission)

    if (trainingPermissionIsValid)
      hasTrainingPermissions
    else {
      if (editorialPermissionIsValid && commercialPermissionIsValid) {
        if (
          List(hasCommercialPermissions, hasEditorialPermissions).contains(
            AccessGranted
          )
        ) {
          AccessGranted
        } else
          AccessDenied
      } else if (commercialPermissionIsValid) {
        hasCommercialPermissions
      } else if (editorialPermissionIsValid)
        hasEditorialPermissions
      else if (emailPermissionIsValid) {
        hasEmailPermissions
      } else AccessDenied
    }
  }
}
