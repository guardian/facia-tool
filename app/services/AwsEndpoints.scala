package services

import com.amazonaws.regions.ServiceAbbreviations.{S3 => S3Endpoint, _}
import com.amazonaws.regions.{Region, Regions}
import conf.Configuration.aws

object AwsEndpoints {
  private lazy val region = Region.getRegion(Regions.fromName(aws.region))

  lazy val sns: String = region.getServiceEndpoint(SNS)
  lazy val elb: String = region.getServiceEndpoint(ElasticLoadbalancing)
  lazy val monitoring: String = region.getServiceEndpoint(CloudWatch)
  lazy val dynamoDb: String = region.getServiceEndpoint(Dynamodb)
  lazy val s3: String = region.getServiceEndpoint(S3Endpoint)
}
