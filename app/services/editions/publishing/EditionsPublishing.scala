package services.editions.publishing

import java.time.OffsetDateTime

import com.gu.pandomainauth.model.User
import model.editions.{EditionsIssue, PublishAction}
import net.logstash.logback.marker.Markers
import play.api.Logger
import services.editions.db.EditionsDB

import scala.collection.JavaConverters._

class EditionsPublishing(publishedBucket: EditionsBucket, previewBucket: EditionsBucket, db: EditionsDB) {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPreviewIssue
    previewBucket.putIssue(previewIssue)
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

    Logger.info(s"Uploading $action request for issue ${issue.id} to S3")(markers)

    val publishedIssue = issue.toPublishableIssue(versionId, action)

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)
  }

  def putEditionsList(rawJson: String) = {
    publishedBucket.putEditionsList(rawJson)
  }

  def publish(issue: EditionsIssue, user: User, version: String) = {

    val action = PublishAction.proof

    val markers = Markers.appendEntries(
      Map(
        "issue-action" -> action.toString,
        "issue-id" -> issue.id,
        "issue-date" -> issue.issueDate.toString,
        "version" -> version,
        "user" -> user.email
      ).asJava
    )

    Logger.info(s"Uploading $action request for issue ${issue.id} to S3")(markers)

    val publishedIssue = issue.toPublishableIssue(version, PublishAction.publish)

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)

  }
}
