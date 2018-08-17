package permissions

import com.gu.permissions.PermissionDefinition

object Permissions {
  val FrontsAccess = PermissionDefinition("fronts_access", "fronts")
  val ConfigureFronts = PermissionDefinition("configure_fronts", "fronts")
  val BreakingNewsAlert = PermissionDefinition("breaking_news_alert", "fronts")
  val LaunchCommercialFrontsAlert = PermissionDefinition("launch_commercial_fronts", "fronts")
  val LaunchEditorialFrontsAlert = PermissionDefinition("launch_editorial_fronts", "fronts")
  val EditEditorialFrontsAlert = PermissionDefinition("edit_editorial_fronts", "fronts")
}
