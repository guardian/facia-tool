package model.editions

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsPublicationHistory(
  id: String,
  status: PublicationStatus,
  launchedOn: Long,
  launchedBy: String,
  launchedEmail: String,
  publishedOn: Option[Long],
  message: Option[String]
)

object EditionsPublicationHistory {
  implicit val writes = Json.writes[EditionsPublicationHistory]

  def fromRow(rs: WrappedResultSet): EditionsPublicationHistory = EditionsPublicationHistory(
    rs.string("id"),
    PublicationStatus.withName(rs.string("status")),
    rs.zonedDateTime("launched_on").toInstant.toEpochMilli,
    rs.string("launched_by"),
    rs.string("launched_email"),
    rs.zonedDateTimeOpt("published_on").map(_.toInstant.toEpochMilli),
    rs.stringOpt("message"),
  )
}
