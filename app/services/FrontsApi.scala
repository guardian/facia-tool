package services

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import conf.ApplicationConfiguration

import scala.concurrent.ExecutionContext.Implicits.global

class FrontsApi(val config: ApplicationConfiguration, val awsEndpoints: AwsEndpoints) {
  val amazonClient: ApiClient = {

    val client = new AmazonS3Client(config.aws.mandatoryCredentials)
    client.setEndpoint(awsEndpoints.s3)
    val bucket = config.aws.bucket
    val stage = config.facia.stage.toUpperCase
    ApiClient(bucket, stage, AmazonSdkS3Client(client))
  }
}
