package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import model.editions.PublishedIssue

class PreviewIssuesBucket(s3Client: AmazonS3, bucketName: String) extends EditionsBucket(s3Client, bucketName) {
  override def createIssueFilename(issue: PublishedIssue): String = "preview.json"
}
