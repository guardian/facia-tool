package permissions

import com.gu.editorial.permissions.client._
import conf.ApplicationConfiguration

import scala.concurrent.ExecutionContext

class Permissions(val appConfig: ApplicationConfiguration) extends PermissionsProvider {
  override implicit lazy val executionContext: ExecutionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext

  implicit def config = PermissionsConfig(
    app = "fronts",
    all = Permissions.all,
    s3BucketPrefix = appConfig.environment.stage.toUpperCase,
    awsCredentials = appConfig.aws.mandatoryCredentials,
    s3Region = Some("eu-west-1")
  )
}

object Permissions {
  val ConfigureFronts = Permission("configure_fronts", "fronts", PermissionDenied)
  val BreakingNewsAlert = Permission("breaking_news_alert", "fronts", PermissionDenied)
  val ToolsAccess = Permission("tools_access", "global", PermissionGranted)

  val all = Seq(ConfigureFronts, BreakingNewsAlert)
}
