package services

import com.gu.etagcaching.aws.sdkv2.s3.S3ObjectFetching
import com.gu.facia.client.{ApiClient, Environment}
import conf.ApplicationConfiguration
import software.amazon.awssdk.auth.credentials.AwsCredentialsProviderChain
import software.amazon.awssdk.regions.Region.EU_WEST_1
import software.amazon.awssdk.services.s3.S3AsyncClient

import software.amazon.awssdk.services.sts.StsClient
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest
import software.amazon.awssdk.auth.credentials._

import scala.concurrent.ExecutionContext.Implicits.global

class FrontsApi(
    val config: ApplicationConfiguration,
    val awsEndpoints: AwsEndpoints
) {
  val amazonClient: ApiClient = {

    val bucket = config.aws.frontsBucket
    val stage = config.facia.stage.toUpperCase

    val stsClient = StsClient
      .builder()
      .region(EU_WEST_1)
      .build()

    val assumeRoleRequest = AssumeRoleRequest
      .builder()
      .roleArn(config.faciatool.stsRoleToAssume)
      .roleSessionName("frontsApi")
      .build()

    val credentialsProvider = AwsCredentialsProviderChain.of(
      EnvironmentVariableCredentialsProvider.create(),
      SystemPropertyCredentialsProvider.create(),
      ProfileCredentialsProvider.builder().profileName("cmsFronts").build()
    )

    val provider = AwsCredentialsProviderChain
      .builder()
      .credentialsProviders(
        ProfileCredentialsProvider.create("cmsFronts"),
        StsAssumeRoleCredentialsProvider
          .builder()
          .stsClient(stsClient)
          .refreshRequest(assumeRoleRequest)
          .build(),
        credentialsProvider
      )
      .build()

    val s3AsyncClient = S3AsyncClient
      .builder()
      .region(EU_WEST_1)
      .credentialsProvider(provider)
      .build()

    ApiClient.withCaching(
      bucket,
      Environment(stage),
      S3ObjectFetching.byteArraysWith(s3AsyncClient)
    )
  }
}
