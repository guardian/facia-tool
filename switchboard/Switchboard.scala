package switchboard

import common._
import switchServices.switch
import play.api.GlobalSettings
import play.api.{Logger, Application, GlobalSettings}

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

      val nextState = response.substring(1, response.length - 1)
        .split(",")
        .map(_.split(":"))
        .map {
          case Array(k, "true") => (k.substring(1, k.length-1), "on")
          case Array(k, "false") => (k.substring(1, k.length-1), "off")
        }
        .toMap

        //pass this map to the switchboard model class
      //for (switch <- Switches.all) {
       // nextState.get(switch.name) foreach {
       //   case "on" => switch.switchOn()
       //   case "off" => switch.switchOff()
        //  case other => Logger.warn(s"Badly configured switch ${switch.name} -> $other")
       // }
      //}
    }
  }
}
