package services.editions.publishing

import java.time.OffsetDateTime

import com.gu.pandomainauth.model.User
import model.editions.EditionsIssue
import services.editions.db.EditionsDB

class EditionsPublishing(publishedBucket: PublishedIssuesBucket, previewBucket: PreviewIssuesBucket, db: EditionsDB) {

  def updatePreview(issue: EditionsIssue) = {
    val previewIssue = issue.toPublishedIssue
    previewBucket.putIssue(previewIssue)
  }

  def publish(issue: EditionsIssue, user: User, now: OffsetDateTime) = {
    val publishedIssue = issue.toPublishedIssue

    // Archive a copy
    publishedBucket.putIssue(publishedIssue)

    // Bump the recently published counters
    db.publishIssue(issue.id, user, now)

    // Push new version to API
    // TODO invoke publish lambda
  }
}

