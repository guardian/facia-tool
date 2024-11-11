package services

import com.amazonaws.regions.ServiceAbbreviations.{S3 => S3Endpoint, _}
import com.amazonaws.regions.{Region, Regions}
import conf.ApplicationConfiguration

class AwsEndpoints(val config: ApplicationConfiguration) {
  private lazy val region =
    Region.getRegion(Regions.fromName(config.aws.region))

  lazy val sns: String = region.getServiceEndpoint(SNS)
  lazy val elb: String = region.getServiceEndpoint(ElasticLoadbalancing)
  lazy val monitoring: String = region.getServiceEndpoint(CloudWatch)
  lazy val dynamoDb: String = region.getServiceEndpoint(Dynamodb)
  lazy val s3: String = region.getServiceEndpoint(S3Endpoint)
}
