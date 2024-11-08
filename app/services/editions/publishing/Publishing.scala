package services.editions.publishing

import java.time.OffsetDateTime
import com.gu.pandomainauth.model.User
import logging.Logging
import model.editions.Edition.{FeastNorthernHemisphere, FeastSouthernHemisphere}
import model.editions.{EditionsIssue, PublishAction}
import net.logstash.logback.marker.Markers
import services.editions.db.EditionsDB
import play.api.libs.json.Writes

import scala.jdk.CollectionConverters._

class Publishing(
    editionsAppPublicationBucket: EditionsAppPublicationTarget,
    editionsAppPreviewBucket: EditionsAppPublicationTarget,
    feastAppPublicationTarget: FeastPublicationTarget,
    db: EditionsDB
) extends Logging {

  def updatePreview(issue: EditionsIssue) = {

    // Archive a copy
    issue.edition match {
      case FeastNorthernHemisphere | FeastSouthernHemisphere =>
        // Feast does not currently support previewing, but we don't need to be reminded of that every time someone drag/drops something!
        // Preview will be implemented, when it exists.
        ()
      case _ =>
        editionsAppPreviewBucket.putIssue(
          issue,
          "preview",
          PublishAction.preview
        )
    }
  }

  def proof(issue: EditionsIssue, user: User, now: OffsetDateTime) = {
    val action = PublishAction.proof

    val versionId = db.createIssueVersion(issue.id, user, now)

    val markers = Markers.appendEntries(
      Map(
        "issue-action" -> action.toString,
        "issue-id" -> issue.id,
        "issue-date" -> issue.issueDate.toString,
        "version" -> versionId,
        "user" -> user.email
      ).asJava
    )

    logger.info(s"Uploading $action request for issue ${issue.id} to S3")(
      markers
    )

    getPublicationTarget(issue).putIssue(issue, versionId, PublishAction.proof)
  }

  def getPublicationTarget(issue: EditionsIssue): PublicationTarget = {
    issue.edition match {
      case FeastNorthernHemisphere | FeastSouthernHemisphere =>
        feastAppPublicationTarget
      case _ =>
        editionsAppPublicationBucket
    }
  }

  def putEditionsList(rawJson: String) = {
    editionsAppPublicationBucket.putEditionsList(rawJson)
  }

  def publish(issue: EditionsIssue, user: User, version: String) = {

    val action = PublishAction.publish

    val markers = Markers.appendEntries(
      Map(
        "issue-action" -> action.toString,
        "issue-id" -> issue.id,
        "issue-date" -> issue.issueDate.toString,
        "version" -> version,
        "user" -> user.email
      ).asJava
    )

    logger.info(s"Uploading $action request for issue ${issue.id} to S3")(
      markers
    )

    val (finalVersion, finalAction) = if (!issue.supportsProofing) {
      val newVersion =
        db.createIssueVersion(issue.id, user, OffsetDateTime.now())
      (
        newVersion,
        PublishAction.proof
      ) // Not very self-explanatory; the use of `PublishAction.proof` here means "build the issue afresh".
    } else {
      (
        version,
        PublishAction.publish
      ) // PublishAction.publish here means "only use the previously proofed issue"
    }

    getPublicationTarget(issue).putIssue(issue, finalVersion, finalAction)
  }

}
