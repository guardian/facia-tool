package switchboard

import akka.actor.Scheduler
import com.amazonaws.auth.AWSCredentialsProvider
import logging.Logging

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

case class SwitchboardConfiguration (
  bucket: String,
  objectKey: String,
  credentials: AWSCredentialsProvider,
  endpoint: String,
  region: String
)

class Lifecycle(conf: SwitchboardConfiguration, scheduler: Scheduler) extends Logging {
  lazy val client: S3client = new S3client(conf, conf.endpoint)

  logger.info("Starting switchboard cache")
  scheduler.schedule(0.seconds, 1.minute) { refreshSwitches() }
  scheduler.scheduleOnce(1.seconds) { refreshSwitches() }

  def refreshSwitches(): Unit = {
    logger.info("Refreshing switches from switchboard")
    client.getSwitches() foreach { response => SwitchManager.updateSwitches(response) }
  }
}
