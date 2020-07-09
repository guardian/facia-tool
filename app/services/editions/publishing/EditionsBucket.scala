package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest}
import com.amazonaws.util.StringInputStream
import model.editions.PublishableIssue
import play.api.libs.json.Json
import PublishedIssueFormatters._

object EditionsBucket {
  def createIssuePrefix(issue: PublishableIssue): String = s"${issue.name.entryName}/${issue.issueDate.toString}"

  def createIssueFilename(issue: PublishableIssue): String = s"${issue.version}.json"

  def createKey(issue: PublishableIssue): String = s"${createIssuePrefix(issue)}/${createIssueFilename(issue)}"

  val objectMetadata: ObjectMetadata = {
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    metadata
  }

  def createPutObjectRequest(bucketName: String, issue: PublishableIssue): PutObjectRequest = {
    val key = EditionsBucket.createKey(issue)
    val issueJson = Json.stringify(Json.toJson(issue))
    new PutObjectRequest(bucketName, key, new StringInputStream(issueJson), EditionsBucket.objectMetadata)
  }
}

class EditionsBucket(s3Client: AmazonS3, bucketName: String) {
  def putIssue(issue: PublishableIssue) = {
    val request = EditionsBucket.createPutObjectRequest(bucketName, issue)
    s3Client.putObject(request)
  }
}
