package permissions

import com.gu.permissions.PermissionDefinition

object Permissions {
  private val app = "fronts"
  val FrontsAccess = PermissionDefinition("fronts_access", app)
  val ConfigureFronts = PermissionDefinition("configure_fronts", app)
  val BreakingNewsAlert = PermissionDefinition("breaking_news_alert", app)
  val LaunchCommercialFronts =
    PermissionDefinition("launch_commercial_fronts", app)
  val LaunchEditorialFronts =
    PermissionDefinition("launch_editorial_fronts", app)
  val EditEditorialFronts = PermissionDefinition("edit_editorial_fronts", app)
  val EditEditions = PermissionDefinition("edit_editions", app)
  val LaunchAndEditEmailFronts =
    PermissionDefinition("edit_and_launch_email_fronts", app)

  val Pinboard = PermissionDefinition("pinboard", "pinboard")
}
