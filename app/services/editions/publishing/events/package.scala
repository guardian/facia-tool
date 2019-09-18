package services.editions.publishing

import play.api.libs.json.{Format, Json}

package object events {

  case class PublishedEvent(status: String, message: String)

  case class PublishEventMessage(receiptHandle: String, event: PublishedEvent)

  object PublishEventMessageFormatter {
    implicit val issuePublishedEventFormat: Format[PublishedEvent] = Json.format[PublishedEvent]
  }

}
