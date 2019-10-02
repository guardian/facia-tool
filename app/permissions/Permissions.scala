package permissions

import com.gu.permissions.PermissionDefinition

object Permissions {
  val FrontsAccess = PermissionDefinition("fronts_access", "fronts")
  val ConfigureFronts = PermissionDefinition("configure_fronts", "fronts")
  val BreakingNewsAlert = PermissionDefinition("breaking_news_alert", "fronts")
  val LaunchCommercialFronts = PermissionDefinition("launch_commercial_fronts", "fronts")
  val LaunchEditorialFronts = PermissionDefinition("launch_editorial_fronts", "fronts")
  val EditEditorialFronts = PermissionDefinition("edit_editorial_fronts", "fronts")
  val EditEditions = PermissionDefinition("edit_editions", "fronts")
}
