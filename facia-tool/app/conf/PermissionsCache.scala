package conf

import permissions.Permissions
import play.api.{Application, GlobalSettings, Logger}
import play.libs.Akka

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

trait PermissionsCache extends GlobalSettings {
  override def onStart(app: Application) {
    super.onStart(app)
    Logger.info("starting permissions cache")
    Akka.system.scheduler.scheduleOnce(1.seconds) { val config = Permissions.config }
  }

}
