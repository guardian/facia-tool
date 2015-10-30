package switchboard

import common._
import switchServices.switch
import switches.switchManager
import play.api.GlobalSettings
import play.api.{Logger, Application, GlobalSettings}
import play.api.libs.json.Json

trait NewSwitchboardLifecycle extends GlobalSettings with ExecutionContexts with Logging {

  override def onStart(app: Application) {
    super.onStart(app)
    Jobs.deschedule("SwitchBoardRefreshJob")
    Jobs.schedule("SwitchBoardRefreshJob", "0 * * * * ?") {
      refresh("switch-status")
    }

    AkkaAsync {
      refresh("switch-status")
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("SwitchBoardRefreshJob")
    super.onStop(app)
  }

  def refresh(configuration: String) {
    Logger.info("Refreshing switches")
    switch.get(configuration) map { response =>

      val switches = Json.parse(response).as[Map[String, Boolean]]

      switchManager.updateSwitches(switches)

    }
  }
}
