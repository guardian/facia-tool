package model.editions

import java.time.LocalDate

import model.editions
import model.editions.PublishAction.PublishAction
import play.api.libs.json.{Json, OWrites}
import scalikejdbc.WrappedResultSet

object PublishAction extends Enumeration
{
  type PublishAction = Value

  // Assigning values
  val preview: editions.PublishAction.Value = Value("preview")
  val proof: editions.PublishAction.Value = Value("proof")
  val publish: editions.PublishAction.Value = Value("publish")

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

  def toPreviewIssue: PublishableIssue = toPublishableIssue("preview", PublishAction.preview)

  def toPublishableIssue(version: String, action: PublishAction): PublishableIssue = PublishableIssue(
    action,
    id,
    edition,
    edition,
    issueDate,
    version,
    if (action == PublishAction.publish) 
      // publish does not need or want config because by definition we are publishing
      // only the previously provided version. We do not want to be able to change content.
      List()   
    else fronts
      .filterNot(_.isHidden) // drop hidden fronts
      .map(_.toPublishedFront) // convert
      .filterNot(_.collections.isEmpty), // drop fronts that contain no collections
    EditionsTemplates.templates.get(edition).map(_.notificationUTCOffset).getOrElse(3)
  )
}

object EditionsIssue {
  implicit val writes: OWrites[EditionsIssue] = Json.writes[EditionsIssue]

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
