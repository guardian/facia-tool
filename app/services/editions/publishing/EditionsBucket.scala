package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest}
import com.amazonaws.util.StringInputStream
import model.editions.PublishedIssue
import play.api.libs.json.Json
import PublishedIssueFormatters._

class EditionsBucket(s3Client: AmazonS3, bucketName: String) {
  def createIssuePrefix(issue: PublishedIssue): String = s"${issue.name}/${issue.issueDate.toString}"

  def createIssueFilename(issue: PublishedIssue): String = s"${issue.publicationEventId}.json"

  def putIssue(issue: PublishedIssue) = {
    val issueJson = Json.stringify(Json.toJson(issue))
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    metadata.addUserMetadata("x-gu-publication-event-id", issue.publicationEventId)
    val key = s"${createIssuePrefix(issue)}/${createIssueFilename(issue)}"
    val request = new PutObjectRequest(bucketName, key, new StringInputStream(issueJson), metadata)
    s3Client.putObject(request)
  }
}
