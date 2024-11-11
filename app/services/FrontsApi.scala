package services

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import conf.ApplicationConfiguration

import scala.concurrent.ExecutionContext.Implicits.global

class FrontsApi(
    val config: ApplicationConfiguration,
    val awsEndpoints: AwsEndpoints
) {
  val amazonClient: ApiClient = {

    val endpoint = new AwsClientBuilder.EndpointConfiguration(
      awsEndpoints.s3,
      config.aws.region
    )

    val client: AmazonS3 = AmazonS3ClientBuilder
      .standard()
      .withCredentials(config.aws.cmsFrontsAccountCredentials)
      .withEndpointConfiguration(endpoint)
      .build()

    val bucket = config.aws.frontsBucket
    val stage = config.facia.stage.toUpperCase
    ApiClient(bucket, stage, AmazonSdkS3Client(client))
  }
}
