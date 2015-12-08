package switchboard

import com.amazonaws.auth.AWSCredentials
import conf.{Configuration, aws}
import play.api.{Application, GlobalSettings, Logger}
import play.libs.Akka

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

case class SwitchboardConfiguration (
  bucket: String,
  objectKey: String,
  credentials: AWSCredentials
)

trait Lifecycle extends GlobalSettings {
  lazy val client: S3client = new S3client(SwitchboardConfiguration(
    bucket = Configuration.switchBoard.bucket,
    objectKey = Configuration.switchBoard.objectKey,
    credentials = aws.mandatoryCredentials.getCredentials
  ))

  override def onStart(app: Application) {
    super.onStart(app)
    Akka.system.scheduler.schedule(initialDelay = 1.seconds, interval = 1.minute) { refreshSwitches() }
  }

  def refreshSwitches() {
    Logger.info("Refreshing switches from switchboard")

    client.getSwitches() foreach { response => SwitchManager.updateSwitches(response) }
  }
}
