package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.gu.editions.PublishedIssue
import play.api.libs.json.Json
import PublishedIssueFormatters._
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest}
import com.amazonaws.util.StringInputStream

abstract class EditionsBucket[T](s3Client: AmazonS3, bucketName: String) {
  def createIssuePrefix(issue: PublishedIssue): String = s"${issue.name}/${issue.issueDate.toLocalDate.toString}"

  def createIssueFilename(issue: PublishedIssue, publicationMetadata: T): String

  def putIssue(issue: PublishedIssue, publicationMetadata: T) = {
    val issueJson = Json.stringify(Json.toJson(issue))
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    val key = s"${createIssuePrefix(issue)}/${createIssueFilename(issue, publicationMetadata)}"
    val request = new PutObjectRequest(bucketName, key, new StringInputStream(issueJson), metadata)
    s3Client.putObject(request)
  }
}
