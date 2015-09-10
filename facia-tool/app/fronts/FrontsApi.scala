package fronts

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.ExecutionContexts
import conf.Configuration
import services.AwsEndpoints
import config.aws
//todo - move the api client
object FrontsApiTMP extends ExecutionContexts {
  val amazonClient: ApiClient = {
    val client = new AmazonS3Client(aws.mandatoryCredentials)
    client.setEndpoint(AwsEndpoints.s3)
    val bucket = Configuration.aws.bucket;
    val stage = Configuration.facia.stage.toUpperCase;
    println("* S3 config on bucket " + bucket + " and stage " + stage)
    ApiClient(bucket, stage, AmazonSdkS3Client(client))
  }
}
