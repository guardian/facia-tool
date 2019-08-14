package model.editions

import java.time.{Instant, OffsetDateTime, ZoneId}

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsIssue(
    id: String,
    displayName: String,
    timezoneId: String,
    issueDate: Long,
    createdOn: Long,
    createdBy: String,
    createdEmail: String,
    launchedOn: Option[Long],
    launchedBy: Option[String],
    launchedEmail: Option[String],
    fronts: List[EditionsFront]
) {
  def toPublishedIssue(version: Option[String] = None): PublishedIssue = PublishedIssue(
    id,
    displayName,
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(issueDate), ZoneId.of(timezoneId)),
    version,
    fronts.filterNot(_.isHidden).map(_.toPublishedFront)
  )
}

object EditionsIssue {
  implicit val writes = Json.writes[EditionsIssue]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsIssue = {
    EditionsIssue(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.string(prefix + "timezone_id"),
      rs.zonedDateTime(prefix + "issue_date").toInstant.toEpochMilli,
      rs.zonedDateTime(prefix + "created_on").toInstant.toEpochMilli,
      rs.string(prefix + "created_by"),
      rs.string(prefix + "created_email"),
      rs.zonedDateTimeOpt(prefix + "launched_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "launched_by"),
      rs.stringOpt(prefix + "launched_email"),
      Nil
    )
  }
}
