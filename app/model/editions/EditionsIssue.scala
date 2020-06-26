package model.editions

import java.time.LocalDate

import model.editions.PublishAction.PublishAction
import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

object PublishAction extends Enumeration
{
  type PublishAction = Value

  // Assigning values
  val preview = Value("preview")
  val proof = Value("proof")
  val publish = Value("publish")

}

case class EditionsIssue(
    id: String,
    edition: Edition,
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

  def toPreviewIssue = toPublishableIssue("preview", PublishAction.preview)

  def toPublishableIssue(version: String, action: PublishAction): PublishableIssue = PublishableIssue(
    action.toString,
    id,
    edition,
    edition,
    issueDate,
    version,
    if (action == PublishAction.publish) List()   // publish does not need or want config
    else fronts
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
      Edition.withName(rs.string(prefix + "name")),
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
