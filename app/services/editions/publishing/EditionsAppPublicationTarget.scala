package services.editions.publishing

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest}
import com.amazonaws.util.StringInputStream
import model.editions.EditionsIssue
import play.api.libs.json.{Json, Writes}
import PublishedIssueFormatters._
import com.typesafe.scalalogging.LazyLogging
import model.editions.PublishAction.PublishAction
import org.apache.commons.lang3.builder.{
  ReflectionToStringBuilder,
  ToStringStyle
}

import java.nio.charset.StandardCharsets

object EditionsAppPublicationTarget extends LazyLogging {

  val baseMetadata: ObjectMetadata = {
    val metadata = new ObjectMetadata()
    metadata.setContentType("application/json")
    metadata
  }

  def createPutObjectRequest[T: Writes](
      bucketName: String,
      key: String,
      issue: T
  ): PutObjectRequest = {
    val issueJson = Json.stringify(Json.toJson(issue))

    // Why do we do this? Well, because if we are sending a streaming PutObjectRequest then S3 requires the length of the stream
    // If it's not explicitly set in ObjectMetadata, then the AWS SDK will consume the entire string into memory just to measure the length.
    // This is pointless as we already _have_ it in memory here (and it creates un-necessary log noise).  So we need to put the BYTE length into the header.
    // Note that the byte length of a UTF-8 string can easily be greater than the character length, which is why we need to use getBytes here.
    val metadata = baseMetadata
    metadata.setContentLength(issueJson.getBytes(StandardCharsets.UTF_8).length)
    new PutObjectRequest(
      bucketName,
      key,
      new StringInputStream(issueJson),
      metadata
    )
  }
}

class EditionsAppPublicationTarget(s3Client: AmazonS3, bucketName: String)
    extends PublicationTarget
    with LazyLogging {
  override def putIssue(
      issue: EditionsIssue,
      version: String,
      action: PublishAction
  ): Either[String, Unit] = {
    val outputKey = createKey(issue, version)
    val publishableIssue = issue.toPublishableIssue(version, action)
    Right(putIssueJson(publishableIssue, outputKey))
  }

  override def putIssueJson[T: Writes](content: T, key: String): Unit = {
    val request = EditionsAppPublicationTarget.createPutObjectRequest(
      bucketName,
      key,
      content
    )
    logger.info(
      ReflectionToStringBuilder.toString(
        request,
        ToStringStyle.MULTI_LINE_STYLE
      )
    )
    s3Client.putObject(request)
  }

  def putEditionsList(rawJson: String): Unit = {
    val metadata = EditionsAppPublicationTarget.baseMetadata
    metadata.setContentLength(rawJson.getBytes(StandardCharsets.UTF_8).length)
    val request = new PutObjectRequest(
      bucketName,
      "editionsList",
      new StringInputStream(rawJson),
      metadata
    )
    s3Client.putObject(request)
  }
}
