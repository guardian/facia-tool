package services.editions.publishing

import play.api.libs.json.{Format, Json}

package object events {

  case class PublishEvent(status: String, message: String)

  case class PublishEventMessage(receiptHandle: String, event: PublishEvent)

  object PublishEventMessageFormatter {
    implicit val issuePublishedEventFormat: Format[PublishEvent] = Json.format[PublishEvent]
  }

}
