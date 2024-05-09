package logging

import play.api.Logger

trait Logging {
  implicit val logger: Logger = Logger(getClass)
}
