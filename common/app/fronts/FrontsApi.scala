package fronts

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.{Configuration, aws}
import services.AwsEndpoints

object FrontsApi extends ExecutionContexts {
  val amazonClient: ApiClient = {

    val client = if (Configuration.aws.crossAccount)
        new AmazonS3Client(aws.mandatoryCrossAccountCredentials)
    else
        new AmazonS3Client(aws.mandatoryCredentials)

    client.setEndpoint(AwsEndpoints.s3)
    val bucket = Configuration.aws.bucket
    val stage = Configuration.facia.stage.toUpperCase
    ApiClient(bucket, stage, AmazonSdkS3Client(client))
  }
}
