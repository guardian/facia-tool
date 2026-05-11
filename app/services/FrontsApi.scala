package services

import com.gu.etagcaching.aws.sdkv2.s3.S3ObjectFetching
import com.gu.facia.client.{ApiClient, Environment}
import conf.ApplicationConfiguration
import software.amazon.awssdk.regions.Region.EU_WEST_1
import software.amazon.awssdk.services.s3.S3AsyncClient

import scala.concurrent.ExecutionContext.Implicits.global

class FrontsApi(
    val config: ApplicationConfiguration
) {
  val amazonClient: ApiClient = {

    val bucket = config.aws.frontsBucket
    val stage = config.facia.stage.toUpperCase

    val s3AsyncClient = S3AsyncClient
      .builder()
      .region(EU_WEST_1)
      .credentialsProvider(config.aws.newStyleCmsFrontsAccountCredentials)
      .build()

    ApiClient.withCaching(
      bucket,
      Environment(stage),
      S3ObjectFetching.byteArraysWith(s3AsyncClient)
    )
  }
}
