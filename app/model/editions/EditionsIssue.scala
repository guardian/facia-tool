package model.editions

import java.time.{LocalDate, ZoneId}
import model.editions
import model.editions.PublishAction.PublishAction
import play.api.libs.json.{Json, OWrites}
import scalikejdbc.WrappedResultSet

object PublishAction extends Enumeration {
  type PublishAction = Value

  // Assigning values
  val preview: editions.PublishAction.Value = Value("preview")
  val proof: editions.PublishAction.Value = Value("proof")
  val publish: editions.PublishAction.Value = Value("publish")

}

case class EditionsIssue(
    id: String,
    edition: Edition,
    platform: CuratedPlatform,
    timezoneId: String,
    issueDate: LocalDate,
    createdOn: Long,
    createdBy: String,
    createdEmail: String,
    launchedOn: Option[Long],
    launchedBy: Option[String],
    launchedEmail: Option[String],
    fronts: List[EditionsFront],
    supportsProofing: Boolean
) {

  // This is a no-op placeholder which matches the UK Daily Edition value.
  // It should never be needed because the Editions Templates object should always
  // contain a matching Edition.  It should (TODO) eventually go away.
  private val defaultOffset = 3

  def toPreviewIssue: PublishableIssue =
    toPublishableIssue("preview", PublishAction.preview)

  def toPublishableIssue(
      version: String,
      action: PublishAction
  ): PublishableIssue = PublishableIssue(
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
    else
      fronts
        .filterNot(_.isHidden) // drop hidden fronts
        .map(_.toPublishedFront) // convert
        .filterNot(
          _.collections.isEmpty
        ), // drop fronts that contain no collections
    EditionsAppTemplates.templates
      .get(edition)
      .map(_.notificationUTCOffset)
      .getOrElse(defaultOffset),
    EditionsAppTemplates.templates.get(edition).map(_.topic)
  )

  def toSkeleton = EditionsIssueSkeleton(
    issueDate,
    ZoneId.of(timezoneId),
    fronts.map(_.toSkeleton)
  )
}

object EditionsIssue {
  implicit val writes: OWrites[EditionsIssue] = Json.writes[EditionsIssue]

  def fromRow(
      rs: WrappedResultSet,
      prefix: String = ""
  ): Either[String, EditionsIssue] = {
    val edition = Edition.withName(rs.string(prefix + "name"))
    val maybePlatform = AllTemplates.templates.get(edition) match {
      case Some(template) => Right(template.platform)
      case None           => Left(s"No template found for edition $edition")
    }

    maybePlatform.map { platform =>
      EditionsIssue(
        id = rs.string(prefix + "id"),
        edition = Edition.withName(rs.string(prefix + "name")),
        platform = platform,
        timezoneId = rs.string(prefix + "timezone_id"),
        issueDate = rs.localDate(prefix + "issue_date"),
        createdOn =
          rs.zonedDateTime(prefix + "created_on").toInstant.toEpochMilli,
        createdBy = rs.string(prefix + "created_by"),
        createdEmail = rs.string(prefix + "created_email"),
        launchedOn = rs
          .zonedDateTimeOpt(prefix + "launched_on")
          .map(_.toInstant.toEpochMilli),
        launchedBy = rs.stringOpt(prefix + "launched_by"),
        launchedEmail = rs.stringOpt(prefix + "launched_email"),
        fronts = Nil,
        supportsProofing = EditionsAppTemplates.templates.contains(
          edition
        ) // proofing is supported by Editions but not Feast
      )
    }
  }
}
