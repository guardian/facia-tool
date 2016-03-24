package logging

import conf.ApplicationConfiguration
import play.api.Logger

import scala.util.control.NonFatal

class LogStashConfig(val config: ApplicationConfiguration) {
  Logger.info("Starting log stash")

  try LogStash.init(config)
  catch {
    case NonFatal(e) => Logger.error("could not configure log stream", e)
  }
}
