package services.editions.publishing

import logging.Logging
import play.api.libs.json.Json
import services.editions.QueueConnector

import scala.util.Try

object IssuePublishEventsReader {
  def apply(queueConnector: QueueConnector): IssuePublishEventsReader =
    new IssuePublishEventsReader(queueConnector)
}

class IssuePublishEventsReader(private val queueConnector: QueueConnector) extends Logging {

  import IssuePublishedSQSMsgFormatter._

  def readPublishEvents: Try[List[IssuePublishedEventWrapper]] = {
    logger.info("read new publish events")
    import Json.{fromJson, parse}
    Try {
      queueConnector.receiveMessages.map(msg => {
        /**
         * .get is used here on option to indicate parse error
         * otherwise it can failed silently
         * see more in IssuePublishEventsReaderTest
         */
        val sqsMSG = fromJson[SQSMessageBody](parse(msg.getBody)).get
        fromJson[IssuePublishedEventWrapper](parse(sqsMSG.Message)).get
      })
    }
  }
}
