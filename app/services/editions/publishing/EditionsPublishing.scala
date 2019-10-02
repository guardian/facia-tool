package services.editions.publishing

import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

import com.gu.pandomainauth.model.User
import model.editions.EditionsIssue
import services.editions.db.EditionsDB

class EditionsPublishing(publishedBucket: EditionsBucket, previewBucket: EditionsBucket, db: EditionsDB) {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPreviewIssue
    previewBucket.putIssue(previewIssue)
  }

  def publish(issue: EditionsIssue, user: User, now: OffsetDateTime) = {
    val publishedIssue = issue.toPublishedIssue(now.format(DateTimeFormatter.ISO_DATE_TIME))

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)

    // Bump the recently published counters
    db.publishIssue(issue.id, user, now)
  }
}

