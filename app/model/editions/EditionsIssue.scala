package model.editions

import java.time.ZonedDateTime

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsIssue(
    id: String,
    displayName: String,
    publishDate: ZonedDateTime,
    createdOn: ZonedDateTime,
    createdBy: String,
    createdEmail: String,
    fronts: List[EditionsFront]
)

object EditionsIssue {
  implicit val writes = Json.writes[EditionsIssue]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsIssue = {
    EditionsIssue(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.zonedDateTime(prefix + "publish_date"),
      rs.zonedDateTime(prefix + "created_on"),
      rs.string(prefix + "created_by"),
      rs.string(prefix + "created_email"),
      Nil
    )
  }
}
