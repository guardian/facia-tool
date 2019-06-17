package model.editions

import java.time.ZonedDateTime

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsIssue(
    id: String,
    displayName: String,
    timezoneId: String,
    issueDate: ZonedDateTime,
    createdOn: ZonedDateTime,
    createdBy: String,
    createdEmail: String,
    launchedOn: Option[ZonedDateTime],
    launchedBy: Option[String],
    launchedEmail: Option[String],
    fronts: List[EditionsFront]
)

object EditionsIssue {
  implicit val writes = Json.writes[EditionsIssue]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsIssue = {
    EditionsIssue(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.string(prefix + "timezone_id"),
      rs.zonedDateTime(prefix + "issue_date"),
      rs.zonedDateTime(prefix + "created_on"),
      rs.string(prefix + "created_by"),
      rs.string(prefix + "created_email"),
      rs.zonedDateTimeOpt(prefix + "launched_on"),
      rs.stringOpt(prefix + "launched_by"),
      rs.stringOpt(prefix + "launched_email"),
      Nil
    )
  }
}
