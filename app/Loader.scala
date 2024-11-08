import metrics.CloudWatchApplicationMetrics
import play.api.ApplicationLoader.Context
import play.api.{
  Application,
  ApplicationLoader,
  Configuration,
  LoggerConfigurator,
  Mode
}
import switchboard.{SwitchboardConfiguration, Lifecycle => SwitchboardLifecycle}
import conf.ApplicationConfiguration

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class Loader extends ApplicationLoader {
  override def load(context: Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    // Play server
    val isProd = context.environment.mode == Mode.Prod
    val config =
      new ApplicationConfiguration(context.initialConfiguration, isProd)

    val playConfig = context.initialConfiguration
    // Override the initial configuration from play to allow play evoltions to work with RDS IAM
    val configWithPassword = Configuration
      .from(
        Map(
          "db.default.url" -> config.postgres.url,
          "db.default.password" -> config.postgres.password
        )
      )
      .withFallback(playConfig)

    val components = new AppComponents(
      context.copy(initialConfiguration = configWithPassword),
      config
    )

    // Background tasks
    new SwitchboardLifecycle(
      SwitchboardConfiguration(
        objectKey = components.config.switchBoard.objectKey,
        bucket = components.config.switchBoard.bucket,
        credentials = components.config.aws.cmsFrontsAccountCredentials,
        endpoint = components.awsEndpoints.s3,
        region = components.config.aws.region
      ),
      components.actorSystem.scheduler
    )

    components.actorSystem.scheduler
      .scheduleWithFixedDelay(initialDelay = 1.seconds, delay = 1.minute) {
        () => components.configAgent.refresh()
      }

    new CloudWatchApplicationMetrics(
      components.config.environment.applicationName,
      components.config.environment.stage,
      components.cloudwatch,
      components.actorSystem.scheduler,
      components.isDev
    )

    components.application
  }
}
