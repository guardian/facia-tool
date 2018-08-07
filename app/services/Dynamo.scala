package services

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDBClientBuilder, AmazonDynamoDB}
import conf.ApplicationConfiguration


class Dynamo(val awsEndpoints: AwsEndpoints, config: ApplicationConfiguration) {
  lazy val client: AmazonDynamoDB = {
    val endpoint = new AwsClientBuilder.EndpointConfiguration(awsEndpoints.dynamoDb, config.aws.region)
    val builder: AmazonDynamoDBClientBuilder = AmazonDynamoDBClientBuilder.standard()
      .withCredentials(config.aws.cmsFrontsAccountCredentials)
      .withEndpointConfiguration(endpoint)
    builder.build()
  }
}
