package services.editions.publishing

import java.time.OffsetDateTime

import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.gu.editions.PublishedIssue
import conf.ApplicationConfiguration
import play.api.libs.json.Json
import services._
import PublishedIssueFormatters._
import com.gu.pandomainauth.model.User

class PublishedIssuesBucket(config: ApplicationConfiguration, awsEndpoints: AwsEndpoints) {

  val bucket = config.aws.publishedEditionsIssuesBucket

  val client = AmazonS3ClientBuilder
    .standard()
    .withCredentials(config.aws.credentials.get)
    .withRegion(config.aws.region)
    .build()

  private def createIssuePath(issue: PublishedIssue, user: User) = {
    val firstName = user.firstName.replace(" ", "_")
    val lastName = user.lastName.replace(" ", "_")
    s"${issue.name}/${issue.issueDate.toLocalDate.toString}/${OffsetDateTime.now().toString}_${firstName}_$lastName.json"
  }

  def putIssue(issue: PublishedIssue, user: User) = {
    client.putObject(bucket, createIssuePath(issue, user), Json.stringify(Json.toJson(issue)))
  }
}
