package services.editions.publishing

import java.time.OffsetDateTime
import com.gu.pandomainauth.model.User
import logging.Logging
import model.editions.Edition.{FeastNorthernHemisphere, FeastSouthernHemisphere}
import model.editions.{Edition, EditionsIssue, PublishAction, PublishableIssue}
import net.logstash.logback.marker.Markers
import services.editions.db.EditionsDB

import scala.jdk.CollectionConverters._

class Publishing(editionsAppPublicationBucket: PublicationTarget,
                 editionsAppPreviewBucket: PublicationTarget,
                 feastAppPublicationTarget: PublicationTarget,
                 db: EditionsDB
                ) extends Logging {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPreviewIssue
    // Archive a copy
    issue.edition match {
      case FeastNorthernHemisphere | FeastSouthernHemisphere =>
        throw new RuntimeException("Feast app does not currently support preview")
      case _ =>
        editionsAppPreviewBucket.putIssue(previewIssue)
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

    logger.info(s"Uploading $action request for issue ${issue.id} to S3")(markers)

    val publishedIssue = issue.toPublishableIssue(versionId, action)

    // Archive a copy
    issue.edition match {
      case FeastNorthernHemisphere | FeastSouthernHemisphere =>
        feastAppPublicationTarget.putIssue(publishedIssue)
      case _ =>
        editionsAppPublicationBucket.putIssue(publishedIssue)
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

    logger.info(s"Uploading $action request for issue ${issue.id} to S3")(markers)

    val publishedIssue = if(version==Publishing.ProofingNotRequiredMagicVersion) {
      val newVersion = db.createIssueVersion(issue.id, user, OffsetDateTime.now())
      issue.toPublishableIssue(newVersion, PublishAction.proof) //if you put `PublishAction.publish` in here, then you don't get any fronts in the output :(
    } else {
      issue.toPublishableIssue(version, PublishAction.publish)
    }

    // Archive a copy
    issue.edition match {
      case FeastNorthernHemisphere | FeastSouthernHemisphere =>
        feastAppPublicationTarget.putIssue(publishedIssue)
      case _ =>
        editionsAppPublicationBucket.putIssue(publishedIssue)
    }
  }
}

object Publishing {
  val ProofingNotRequiredMagicVersion = "proofing-not-required"
}
