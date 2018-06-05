package logging

import conf.ApplicationConfiguration

import scala.util.control.NonFatal

class LogStashConfig(val config: ApplicationConfiguration) extends Logging {
  logger.info("Starting log stash")

  try LogStash.init(config)
  catch {
    case NonFatal(e) => logger.error("could not configure log stream", e)
  }
}
