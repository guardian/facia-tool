package permissions

import com.gu.permissions.{PermissionDefinition, PermissionsProvider}
import logging.Logging
import play.api.libs.json.Json

import scala.io.Source
import scala.util.Using

class E2EPermissionsProvider(permissionsByName: Map[String, Set[String]])
    extends PermissionsProvider {
  private val app = "fronts"

  override def storeIsEmpty: Boolean = permissionsByName.isEmpty

  override def hasPermission(
      permission: PermissionDefinition,
      email: String
  ): Boolean =
    permissionsByName.getOrElse(permission.name, Set.empty).contains(email)

  override def listPermissions(
      email: String
  ): Map[PermissionDefinition, Boolean] =
    permissionsByName.map { case (name, emails) =>
      PermissionDefinition(name, app) -> emails.contains(email)
    }

  override def allUserEmails(): Set[String] =
    permissionsByName.values.flatten.toSet
}

object E2EPermissionsProvider extends Logging {
  def fromFile(path: String): E2EPermissionsProvider = {
    logger.info(s"Loading e2e permissions fixture from $path")
    val raw = Using.resource(Source.fromFile(path))(_.mkString)
    val parsed = Json.parse(raw).as[Map[String, List[String]]]
    new E2EPermissionsProvider(parsed.view.mapValues(_.toSet).toMap)
  }
}
