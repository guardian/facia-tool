package services.editions.publishing

import model.editions.PublicationStatus
import play.api.libs.json.{Format, Json}

package object events {

  case class PublishEvent(status: PublicationStatus, message: String)

  case class PublishEventMessage(receiptHandle: String, event: PublishEvent)

  object PublishEventMessageFormatter {
    implicit val issuePublishedEventFormat: Format[PublishEvent] = Json.format[PublishEvent]
  }

}
