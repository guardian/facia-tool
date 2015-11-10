package permissions

import com.gu.editorial.permissions.client._
import conf.Configuration
import conf.aws

import scala.concurrent.{ExecutionContext, Future}

object Permissions extends PermissionsProvider {
  override implicit lazy val executionContext: ExecutionContext = play.api.libs.concurrent.Execution.Implicits.defaultContext

  lazy val ConfigureFronts = Permission("configure_fronts", "fronts", PermissionDenied)

  lazy val all = Seq(ConfigureFronts)

  implicit def config = PermissionsConfig(
    app = "fronts",
    all = all,
    s3BucketPrefix = Configuration.environment.stage.toUpperCase,
    awsCredentials = aws.mandatoryCredentials,
    s3Region = Some("eu-west-1")
  )
}
