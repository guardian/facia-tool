package model.editions

import java.time.LocalDate

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsIssue(
    id: String,
    name: String,
    timezoneId: String,
    issueDate: LocalDate,
    createdOn: Long,
    createdBy: String,
    createdEmail: String,
    launchedOn: Option[Long],
    launchedBy: Option[String],
    launchedEmail: Option[String],
    fronts: List[EditionsFront]
) {
  def toPreviewIssue: PublishedIssue = toPublishedIssue("preview")

  def toPublishedIssue(version: String): PublishedIssue = PublishedIssue(
    id,
    name,
    name,
    issueDate,
    version,
    fronts
      .filterNot(_.isHidden) // drop hidden fronts
      .map(_.toPublishedFront) // convert
      .filterNot(_.collections.isEmpty) // drop fronts that contain no collections
  )
}

object EditionsIssue {
  implicit val writes = Json.writes[EditionsIssue]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsIssue = {
    EditionsIssue(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.string(prefix + "timezone_id"),
      rs.localDate(prefix + "issue_date"),
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
