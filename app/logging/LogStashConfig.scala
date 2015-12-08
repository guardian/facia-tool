package logging

import play.api.{Application, GlobalSettings, Logger}

import scala.util.control.NonFatal

trait LogStashConfig extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)
    Logger.info("configuring log stash")
    try LogStash.init()
    catch {
      case NonFatal(e) => Logger.error("could not configure log stream", e)
    }
  }

}
