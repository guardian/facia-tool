package logging

import org.slf4j.LoggerFactory

trait Logging {
  implicit val logger = LoggerFactory.getLogger(getClass)
}
