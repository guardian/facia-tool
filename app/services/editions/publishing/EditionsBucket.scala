package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest, PutObjectResult}
import com.amazonaws.util.StringInputStream
import model.editions.PublishableIssue
import play.api.libs.json.{Json, Writes}
import PublishedIssueFormatters._
import com.typesafe.scalalogging.LazyLogging
import org.apache.commons.io.output.ByteArrayOutputStream
import org.apache.commons.lang3.builder.{ReflectionToStringBuilder, ToStringStyle}
import services.editions.publishing.EditionsBucket.logger

import java.io.ObjectOutputStream
import java.nio.charset.StandardCharsets

object EditionsBucket extends LazyLogging {

  def createIssuePrefix(issue: PublishableIssue): String = s"${issue.name.entryName}/${issue.issueDate.toString}"

  def createIssueFilename(issue: PublishableIssue): String = s"${issue.version}.json"

  def createKey(issue: PublishableIssue): String = s"${createIssuePrefix(issue)}/${createIssueFilename(issue)}"

  val objectMetadata: ObjectMetadata = {
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    metadata
  }

  def createPutObjectRequest[T:Writes](bucketName: String, key: String, issue: T): PutObjectRequest = {
    val issueJson = Json.stringify(Json.toJson(issue))
    val baseMd = EditionsBucket.objectMetadata
    baseMd.setContentLength(issueJson.length)
    logger.info(s"createPutObjectRequest: sending ${issueJson.length} chars to $bucketName")
    new PutObjectRequest(bucketName, key, new StringInputStream(issueJson), baseMd)
  }
}

class EditionsBucket(s3Client: AmazonS3, bucketName: String) extends PublicationTarget with LazyLogging {
  def putIssue(issue: PublishableIssue): Unit = {
    val key = EditionsBucket.createKey(issue)
    putIssueJson(issue, key)
  }

  override def putIssueJson[T: Writes](content: T, key:String): Unit = {
    val request = EditionsBucket.createPutObjectRequest(bucketName, key, content)
    logger.info(ReflectionToStringBuilder.toString(request, ToStringStyle.MULTI_LINE_STYLE))
    s3Client.putObject(request)
  }

  def putEditionsList(rawJson: String): Unit = {
    val request = new PutObjectRequest(bucketName, "editionsList", new StringInputStream(rawJson), EditionsBucket.objectMetadata)
    s3Client.putObject(request)
  }
}
