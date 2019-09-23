package model.editions

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class PublishedIssueStatus(
  id: String,
  status: PublicationStatus,
  launchedOn: Long,
  launchedBy: String,
  launchedEmail: String,
  publishedOn: Option[Long],
  message: Option[String]
)

object PublishedIssueStatus {
  implicit val writes = Json.writes[PublishedIssueStatus]

  def fromRow(rs: WrappedResultSet): PublishedIssueStatus = PublishedIssueStatus(
    rs.string("id"),
    PublicationStatus.withName(rs.string("status")),
    rs.zonedDateTime("launched_on").toInstant.toEpochMilli,
    rs.string("launched_by"),
    rs.string("launched_email"),
    rs.zonedDateTimeOpt("published_on").map(_.toInstant.toEpochMilli),
    rs.stringOpt("message"),
  )
}
