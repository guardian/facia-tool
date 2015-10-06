package conf

import permissions.PermissionsJob
import play.api.{Logger, Application, GlobalSettings}


trait PermissionsCache extends GlobalSettings {
  override def onStart(app: Application) {
    super.onStart(app)
    Logger.info("starting permissions cache")
    val job = new PermissionsJob()
    job.start()
  }

}
