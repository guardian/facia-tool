package services.editions.publishing

import java.time.OffsetDateTime

import com.amazonaws.services.s3.AmazonS3
import com.gu.editions.PublishedIssue

class PublishedIssuesBucket(s3Client: AmazonS3, bucketName: String) extends EditionsBucket(s3Client, bucketName) {
  override def createIssueFilename(issue: PublishedIssue): String = {
    s"${OffsetDateTime.now()}.json"
  }
}
