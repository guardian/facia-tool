import logging.LogStashConfig
import metrics.CloudWatchApplicationMetrics
import play.api.ApplicationLoader.Context
import play.api.{Application, ApplicationLoader, LoggerConfigurator}
import switchboard.{SwitchboardConfiguration, Lifecycle => SwitchboardLifecycle}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

class Loader extends ApplicationLoader {
  override def load(context: Context): Application = {
    LoggerConfigurator(context.environment.classLoader).foreach {
      _.configure(context.environment)
    }

    val components = new AppComponents(context)

    new SwitchboardLifecycle(SwitchboardConfiguration(
      objectKey = components.appConfiguration.switchBoard.objectKey,
      bucket = components.appConfiguration.switchBoard.bucket,
      credentials = components.appConfiguration.aws.mandatoryCredentials,
      endpoint = components.awsEndpoints.s3,
      region = components.appConfiguration.aws.region
    ), components.actorSystem.scheduler)

    components.actorSystem.scheduler.schedule(initialDelay = 1.seconds, interval = 1.minute) { components.configAgent.refresh() }

    new CloudWatchApplicationMetrics(
      components.appConfiguration.environment.applicationName,
      components.appConfiguration.environment.stage,
      components.cloudwatch,
      components.actorSystem.scheduler,
      components.isDev
    )
    new LogStashConfig(components.appConfiguration)

    components.application
  }
}
