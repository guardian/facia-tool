package services.editions.publishing

import com.amazonaws.services.sqs.model.Message
import logging.Logging
import play.api.libs.json.Json.parse
import play.api.libs.json.{JsError, JsSuccess}
import services.editions.publishing.IssuePublishedSQSMsgFormatter._


object IssuePublishedSNSMessageParser extends Logging {

  def parseToEvent(snsNotificationFromSQS: Message): Option[PublishEventMessage] = {
    logger.info("read new publish events")
    val messageBody = (parse(snsNotificationFromSQS.getBody) \ "Message").validate[String]
    messageBody match {
      case JsSuccess(value, _) =>
        (parse(value) \ "event").validate[PublishedEvent] match {
          case JsSuccess(parsedEvent, _) =>
            val messageID = snsNotificationFromSQS.getReceiptHandle
            Some(PublishEventMessage(messageID, parsedEvent))
          case JsError(errors) =>
            logger.error(s"errors while parsing SQS message $errors")
            None
        }
      case JsError(errors) => {
        logger.error(s"errors while parsing SQS message $errors")
        None
      }
    }
  }
}
