package switchboard

import play.api.Logger
import play.api.libs.json.{Json, JsValue}

object SwitchManager {

  var switches: Map[String, Boolean] = Map()

  def updateSwitches(newSwitches: Map[String, Boolean] ): Unit = {
    switches = newSwitches
  }

  def getStatus(switchName:String): Boolean = {
    switches.get(switchName) match {
        case Some(value) => value
        case None => {
          Logger.warn(s"No status found matching switch ${switchName}")
          false
        }
    }
  }

  def getSwitchesAsJson(): JsValue = Json.toJson(switches)
}
