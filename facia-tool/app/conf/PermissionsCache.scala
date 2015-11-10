package conf

import common.ExecutionContexts
import permissions.Permissions
import play.api.{Logger, Application, GlobalSettings}
import play.libs.Akka
import scala.concurrent.duration._

trait PermissionsCache extends GlobalSettings with ExecutionContexts {
  override def onStart(app: Application) {
    super.onStart(app)
    Logger.info("starting permissions cache")
    Akka.system.scheduler.scheduleOnce(1.seconds) { val config = Permissions.config }
  }

}
