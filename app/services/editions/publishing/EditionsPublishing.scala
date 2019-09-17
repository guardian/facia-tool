package services.editions.publishing

import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

import com.gu.pandomainauth.model.User
import model.editions.EditionsIssue
import services.editions.db.EditionsDB

class EditionsPublishing(publishedBucket: EditionsBucket, previewBucket: EditionsBucket, db: EditionsDB) {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPublishedIssue()
    previewBucket.putIssue(previewIssue)
  }

  def publish(issue: EditionsIssue, user: User, now: OffsetDateTime) = {
    // Bump the recently published counters
    val publicationEventId = db.publishIssue(issue.id, user, now)

    val publishedIssue = issue.toPublishedIssue(Some(publicationEventId))

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)
  }
}
