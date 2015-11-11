package switchboard

import common.ExecutionContexts
import play.api.{Logger, Application, GlobalSettings}
import play.api.libs.json.Json
import scala.concurrent.duration._
import play.libs.Akka
import com.amazonaws.auth.AWSCredentials
import conf.{Configuration, aws}

case class SwitchboardConfiguration (
  bucket: String,
  objectKey: String,
  credentials: AWSCredentials
)

trait Lifecycle extends GlobalSettings with ExecutionContexts {
  lazy val client: S3client = new S3client(SwitchboardConfiguration(
    bucket = Configuration.switchBoard.bucket,
    objectKey = Configuration.switchBoard.objectKey,
    credentials = aws.mandatoryCredentials.getCredentials
  ))

  override def onStart(app: Application) {
    super.onStart(app)

    Akka.system.scheduler.schedule(0.seconds, 1.minute) { refreshSwitches() }
    Akka.system.scheduler.scheduleOnce(1.seconds) { refreshSwitches() }
  }

  def refreshSwitches() {
    Logger.info("Refreshing switches from switchboard")

    client.get() foreach { response => SwitchManager.updateSwitches(response) }
  }
}
