package model.editions

import java.time.ZonedDateTime

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsIssue(
    id: String,
    displayName: String,
    issueDate: ZonedDateTime,
    createdOn: ZonedDateTime,
    createdBy: String,
    createdEmail: String,
    launchedOn: ZonedDateTime,
    launchedBy: String,
    launchedEmail: String,
    fronts: List[EditionsFront]
)

object EditionsIssue {
  implicit val writes = Json.writes[EditionsIssue]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsIssue = {
    EditionsIssue(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.zonedDateTime(prefix + "issue_date"),
      rs.zonedDateTime(prefix + "created_on"),
      rs.string(prefix + "created_by"),
      rs.string(prefix + "created_email"),
      rs.zonedDateTime(prefix + "launched_on"),
      rs.string(prefix + "launched_by"),
      rs.string(prefix + "launched_email"),
      Nil
    )
  }
}
