package services.editions

import play.api.libs.json.{Format, Json}

package object publishing {

  case class PublishedEvent(status: String, message: String)

  case class PublishEventMessage(receiptHandle: String, event: PublishedEvent)

  object IssuePublishedSQSMsgFormatter {
    implicit val issuePublishedEventFormat: Format[PublishedEvent] = Json.format[PublishedEvent]
  }

}
