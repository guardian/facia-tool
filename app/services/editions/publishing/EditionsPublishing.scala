package services.editions.publishing

import com.gu.pandomainauth.model.User
import model.editions.EditionsIssue
import services.editions.db.EditionsDB

class EditionsPublishing(bucket: PublishedIssuesBucket, db: EditionsDB) {

  def publish(issue: EditionsIssue, user: User) = {
    val publishedIssue = issue.toPublishedIssue()

    // Archive a copy
    bucket.putIssue(publishedIssue, user)

    // Bump the recently published counters
    db.publishIssue(issue.id, user)

    // Push new version to API
    // TODO invoke publish lambda
  }
}

