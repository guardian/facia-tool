package switchboard

import conf.Configuration
import common._
import switchServices.switch
import switches.switchManager
import play.api.GlobalSettings
import play.api.{Logger, Application, GlobalSettings}
import play.api.libs.json.Json
import scala.concurrent.duration._
import play.libs.Akka

trait NewSwitchboardLifecycle extends GlobalSettings with ExecutionContexts with Logging {

  override def onStart(app: Application) {
    super.onStart(app)
    Akka.system.scheduler.schedule(0.seconds, 1.minute) { refreshSwitches() }

    AkkaAsync {
      refreshSwitches()
    }
  }

  override def onStop(app: Application) {
    super.onStop(app)
  }

  def refreshSwitches() {
    Logger.info("Refreshing switches")

    switch.get(Configuration.switchBoard.key) map { response =>

      try {
        val switches = Json.parse(response).as[Map[String, Boolean]]
        switchManager.updateSwitches(switches)
      }
      catch {
        case e: Exception => {
          Logger.error(s"Badly configured switch in ${response}")
          throw e
        }
      }
    }
  }
}
