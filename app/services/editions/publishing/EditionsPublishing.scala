package services.editions.publishing

import java.time.OffsetDateTime

import com.gu.pandomainauth.model.User
import model.editions.EditionsIssue
import net.logstash.logback.marker.Markers
import play.api.Logger
import services.editions.db.EditionsDB

import scala.collection.JavaConverters._

class EditionsPublishing(publishedBucket: EditionsBucket, previewBucket: EditionsBucket, db: EditionsDB) {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPreviewIssue()
    previewBucket.putIssue(previewIssue)
  }

  def publish(issue: EditionsIssue, user: User, now: OffsetDateTime) = {
    // Bump the recently published counters
    val versionId = db.publishIssue(issue.id, user, now)

    val markers = Markers.appendEntries(
      Map (
        "issue-id" -> issue.id,
        "issue-date" -> issue.issueDate,
        "version" -> versionId,
        "user" -> user.email
      ).asJava
    )

    Logger.info(s"Publishing issue ${issue.id}")(markers)

    val publishedIssue = issue.toPublishedIssue(versionId)

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)
  }
}
