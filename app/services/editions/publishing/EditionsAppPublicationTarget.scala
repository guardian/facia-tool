package services.editions.publishing

import model.editions.EditionsIssue
import play.api.libs.json.{Json, Writes}
import PublishedIssueFormatters._
import com.typesafe.scalalogging.LazyLogging
import model.editions.PublishAction.PublishAction
import org.apache.commons.lang3.builder.{
  ReflectionToStringBuilder,
  ToStringStyle
}
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest

import java.nio.charset.StandardCharsets

object EditionsAppPublicationTarget extends LazyLogging {

  def createPutObjectRequest[T: Writes](
      bucketName: String,
      key: String,
      issue: T
  ): (PutObjectRequest, RequestBody) = {
    val issueJson = Json.stringify(Json.toJson(issue))
    // The byte length of a UTF-8 string can exceed its character length, so measure the encoded bytes.
    val bytes = issueJson.getBytes(StandardCharsets.UTF_8)
    val request = PutObjectRequest
      .builder()
      .bucket(bucketName)
      .key(key)
      .contentType("application/json")
      .contentLength(bytes.length.toLong)
      .build()
    (request, RequestBody.fromBytes(bytes))
  }
}

class EditionsAppPublicationTarget(s3Client: S3Client, bucketName: String)
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
    val (request, body) = EditionsAppPublicationTarget.createPutObjectRequest(
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
    s3Client.putObject(request, body)
  }

  def putEditionsList(rawJson: String): Unit = {
    val bytes = rawJson.getBytes(StandardCharsets.UTF_8)
    val request = PutObjectRequest
      .builder()
      .bucket(bucketName)
      .key("editionsList")
      .contentType("application/json")
      .contentLength(bytes.length.toLong)
      .build()
    s3Client.putObject(request, RequestBody.fromBytes(bytes))
  }
}
