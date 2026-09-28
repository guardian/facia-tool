package services

import play.api.libs.json.{Json, Writes}
import software.amazon.awssdk.services.sns.SnsAsyncClient
import software.amazon.awssdk.services.sns.model.{PublishRequest, PublishResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.jdk.FutureConverters._
import logging.Logging

object SNSTopics {
  implicit class RichSnsAsyncClient(client: SnsAsyncClient) {
    def publishMessageFuture(
        topicArn: String,
        message: String
    ): Future[PublishResponse] = {
      val request = PublishRequest
        .builder()
        .topicArn(topicArn)
        .message(message)
        .build()
      client.publish(request).asScala
    }
  }
}

case class JsonMessageTopic[A](client: SnsAsyncClient, topicArn: String)(
    implicit executionContext: ExecutionContext
) extends Logging {
  import SNSTopics._

  def send(a: A)(implicit writes: Writes[A]): Future[PublishResponse] = {
    client.publishMessageFuture(
      topicArn: String,
      Json.stringify(Json.toJson(a))
    )
  }
}
