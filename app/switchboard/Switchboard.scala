package switchboard

import akka.actor.Scheduler
import com.amazonaws.auth.AWSCredentialsProvider
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

case class SwitchboardConfiguration (
  bucket: String,
  objectKey: String,
  credentials: AWSCredentialsProvider,
  endpoint: String,
  region: String
)

class Lifecycle(conf: SwitchboardConfiguration, scheduler: Scheduler) {
  lazy val client: S3client = new S3client(conf, conf.endpoint)

  Logger.info("Starting switchboard cache")
  scheduler.schedule(0.seconds, 1.minute) { refreshSwitches() }
  scheduler.scheduleOnce(1.seconds) { refreshSwitches() }

  def refreshSwitches() {
    Logger.info("Refreshing switches from switchboard")
    client.getSwitches() foreach { response => SwitchManager.updateSwitches(response) }
  }
}
