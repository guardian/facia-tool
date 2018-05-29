package logging

import play.api.Logger

trait Logging {
  implicit val logger = Logger(getClass)
}
