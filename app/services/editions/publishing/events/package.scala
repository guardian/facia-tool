package services.editions.publishing

import java.time.{LocalDate, LocalDateTime}

import model.editions.{Edition, EditionIssueVersionId, IssueVersionStatus}
import play.api.libs.json.{Format, Json}

package object events {
  case class PublishEvent(
    edition: Edition,
    version: EditionIssueVersionId,
    issueDate: LocalDate,
    status: IssueVersionStatus,
    message: String,
    timestamp: LocalDateTime
  )

  case class PublishEventMessage(receiptHandle: String, event: PublishEvent)

  object PublishEventMessageFormatter {
    implicit val issuePublishedEventFormat: Format[PublishEvent] = Json.format[PublishEvent]
  }
}
