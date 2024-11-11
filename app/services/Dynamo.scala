package services

import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.services.dynamodbv2.{
  AmazonDynamoDB,
  AmazonDynamoDBClientBuilder
}

object Dynamo {
  def client(
      awsCredentials: AWSCredentialsProvider,
      region: String
  ): AmazonDynamoDB = {
    val builder: AmazonDynamoDBClientBuilder = AmazonDynamoDBClientBuilder
      .standard()
      .withCredentials(awsCredentials)
      .withRegion(region)
    builder.build()
  }
}
