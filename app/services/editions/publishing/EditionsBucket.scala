package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest}
import com.amazonaws.util.StringInputStream
import model.editions.PublishedIssue
import play.api.libs.json.Json
import PublishedIssueFormatters._

class EditionsBucket(s3Client: AmazonS3, bucketName: String) {
  def createIssuePrefix(issue: PublishedIssue): String = s"${issue.name}/${issue.issueDate.toString}"

  def createIssueFilename(issue: PublishedIssue): String = {
    val keyname = issue.publicationEventId.getOrElse("preview")
    s"$keyname.json"
  }

  def putIssue(issue: PublishedIssue) = {
    val issueJson = Json.stringify(Json.toJson(issue))
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    issue.publicationEventId.foreach(metadata.addUserMetadata("publication-event-id", _))
    val key = s"${createIssuePrefix(issue)}/${createIssueFilename(issue)}"
    val request = new PutObjectRequest(bucketName, key, new StringInputStream(issueJson), metadata)
    s3Client.putObject(request)
  }
}
