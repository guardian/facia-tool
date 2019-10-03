package model.editions

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet
import enumeratum.{EnumEntry, PlayEnum}

sealed abstract class IssueVersionStatus extends EnumEntry

object IssueVersionStatus extends PlayEnum[IssueVersionStatus] {
  case object Started extends IssueVersionStatus

  // The values below should match the `Status` provided by the Editions Archiver lambda
  // See https://github.com/guardian/editions/blob/34ed6cdacc9bc7a2c5b2067f58a6635704b8e425/projects/archiver/src/tasks/notification/helpers/pub-status-notifier.ts#L7
  case object Processing extends IssueVersionStatus
  case object Published extends IssueVersionStatus
  case object Failed extends IssueVersionStatus

  override def values = findValues
}

case class IssueVersionEvent(
  eventTime: Long,
  status: IssueVersionStatus,
  message: Option[String]
)

object IssueVersionEvent {
  implicit val reads = Json.reads[IssueVersionEvent]
  implicit val writes = Json.writes[IssueVersionEvent]

  def fromRow(rs: WrappedResultSet): IssueVersionEvent = IssueVersionEvent(
    rs.zonedDateTime("event_time").toInstant.toEpochMilli,
    IssueVersionStatus.withName(rs.string("event_status")),
    rs.stringOpt("event_message")
  )
}

case class IssueVersion(
  id: EditionIssueVersionId,
  launchedOn: Long,
  launchedBy: String,
  launchedEmail: String,
  events: List[IssueVersionEvent]
)

object IssueVersion {
  implicit val reads = Json.reads[IssueVersion]
  implicit val writes = Json.writes[IssueVersion]

  def fromRow(rs: WrappedResultSet): IssueVersion = IssueVersion(
    rs.string("version_id"),
    rs.zonedDateTime("version_launched_on").toInstant.toEpochMilli,
    rs.string("version_launched_by"),
    rs.string("version_launched_email"),
    events = List.empty
  )
}
