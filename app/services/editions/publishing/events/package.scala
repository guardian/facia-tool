package services.editions.publishing

import java.time.{LocalDate, LocalDateTime}

import model.editions.{Edition, EditionIssueVersionId, IssueVersionStatus}
import net.logstash.logback.marker.{LogstashMarker, Markers}
import play.api.libs.json.{Format, Json}
import scala.jdk.CollectionConverters._

package object events {
  case class PublishEvent(
      edition: Edition,
      version: EditionIssueVersionId,
      issueDate: LocalDate,
      status: IssueVersionStatus,
      message: String,
      timestamp: LocalDateTime
  ) {
    def toLogMarker: LogstashMarker = {
      val markers = Map(
        "edition" -> edition.toString,
        "issueVersion" -> version,
        "issueDate" -> issueDate.toString,
        "issueVersionStatus" -> status.toString,
        "issueEventMessage" -> message,
        "issueEventTimestamp" -> timestamp.toString
      )

      Markers.appendEntries(markers.asJava)
    }
  }

  case class PublishEventMessage(receiptHandle: String, event: PublishEvent)

  object PublishEventMessageFormatter {
    implicit val issuePublishedEventFormat: Format[PublishEvent] =
      Json.format[PublishEvent]
  }
}
