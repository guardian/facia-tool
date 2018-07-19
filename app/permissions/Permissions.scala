package permissions

import com.gu.permissions.PermissionDefinition

object Permissions {
  val FrontsAccess = PermissionDefinition("fronts_access", "fronts")
  val ConfigureFronts = PermissionDefinition("configure_fronts", "fronts")
  val BreakingNewsAlert = PermissionDefinition("breaking_news_alert", "fronts")
}
