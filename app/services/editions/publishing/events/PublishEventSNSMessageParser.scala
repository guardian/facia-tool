package services.editions.publishing.events

import com.amazonaws.services.sqs.model.Message
import logging.Logging
import play.api.libs.json.Json.parse
import play.api.libs.json.{JsError, JsSuccess}
import services.editions.publishing.events.PublishEventMessageFormatter._

private[events] object PublishEventSNSMessageParser extends Logging {

  def parseToEvent(snsNotificationFromSQS: Message): Option[PublishEventMessage] = {
    logger.info("read new publish events")
    val messageBody = snsNotificationFromSQS.getBody
    val validatedMessage = (parse(messageBody) \ "Message").validate[String]
    validatedMessage match {
      case JsSuccess(value, _) =>
        (parse(value) \ "event").validate[PublishEvent] match {
          case JsSuccess(parsedEvent, _) =>
            val messageID = snsNotificationFromSQS.getReceiptHandle
            Some(PublishEventMessage(messageID, parsedEvent))
          case JsError(errors) =>
            logger.error(s"errors while parsing SQS message: $value, errors: $errors")
            None
        }
      case JsError(errors) => {
        logger.error(s"errors while parsing SQS message: $messageBody, errors $errors")
        None
      }
    }
  }
}
