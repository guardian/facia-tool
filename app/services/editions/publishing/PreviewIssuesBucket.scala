package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.gu.editions.PublishedIssue

class PreviewIssuesBucket(s3Client: AmazonS3, bucketName: String) extends EditionsBucket[Unit](s3Client, bucketName) {
  override def createIssueFilename(issue: PublishedIssue, publicationMetadata: Unit): String = "preview.json"
}
