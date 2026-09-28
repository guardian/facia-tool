package services

import com.amazonaws.services.s3.AmazonS3.{ENDPOINT_PREFIX => S3Endpoint}
import com.amazonaws.regions.RegionUtils
import conf.ApplicationConfiguration

class AwsEndpoints(val config: ApplicationConfiguration) {
  private lazy val region =
    RegionUtils.getRegion(config.aws.region)

  lazy val s3: String = region.getServiceEndpoint(S3Endpoint)
}
