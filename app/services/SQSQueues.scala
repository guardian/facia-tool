package services

import java.util.concurrent.{Future => JavaFuture}

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.sqs.AmazonSQSAsync
import com.amazonaws.services.sqs.model._
import play.api.libs.json.{Json, Writes}

import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success}
import com.amazonaws.services.sns.AmazonSNSAsync
import com.amazonaws.services.sns.model.PublishResult
import com.amazonaws.services.sns.model.PublishRequest

object SQSQueues {
  implicit class RichAmazonSQSAsyncClient(client: AmazonSQSAsync) {
    private def createHandler[A <: com.amazonaws.AmazonWebServiceRequest, B]() = {
      val promise = Promise[B]()

      val handler = new AsyncHandler[A, B] {
        override def onSuccess(request: A, result: B): Unit = promise.complete(Success(result))

        override def onError(exception: Exception): Unit = promise.complete(Failure(exception))
      }

      (promise.future, handler)
    }

    private def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](f: AsyncHandler[A, B] => JavaFuture[B]) = {
      val (future, handler) = createHandler[A, B]()
      f(handler)
      future
    }

    def sendMessageFuture(request: SendMessageRequest): Future[SendMessageResult] =
      asFuture[SendMessageRequest, SendMessageResult](client.sendMessageAsync(request, _))
  }
}

object SNSTopics {
  implicit class RichAmazonSNSAsyncClient(client: AmazonSNSAsync) {
    private def createHandler[A <: com.amazonaws.AmazonWebServiceRequest, B]() = {
      val promise = Promise[B]()

      val handler = new AsyncHandler[A, B] {
        override def onSuccess(request: A, result: B): Unit = promise.complete(Success(result))

        override def onError(exception: Exception): Unit = promise.complete(Failure(exception))
      }

      (promise.future, handler)
    }

    private def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](f: AsyncHandler[A, B] => JavaFuture[B]) = {
      val (future, handler) = createHandler[A, B]()
      f(handler)
      future
    }

    def publishMessageFuture(topicArn: String, message: String): Future[PublishResult] =
      asFuture[PublishRequest, PublishResult](client.publishAsync(topicArn, message, _))
  }
}

/** Utility class for SQS queues that use JSON to serialize their messages */
case class JsonMessageQueue[A](client: AmazonSQSAsync, queueUrl: String)
                              (implicit executionContext: ExecutionContext) {
  import SQSQueues._

  def send(a: A)(implicit writes: Writes[A]): Future[SendMessageResult] = {
    client.sendMessageFuture(new SendMessageRequest()
      .withQueueUrl(queueUrl)
      .withMessageBody(Json.stringify(Json.toJson(a)))
    )
  }
}

case class JsonMessageTopic[A](client: AmazonSNSAsync, topicArn: String)
                              (implicit executionContext: ExecutionContext) {
  import SNSTopics._

  def send(a: A)(implicit writes: Writes[A]): Future[PublishResult] = {
    client.publishMessageFuture(topicArn: String, Json.stringify(Json.toJson(a)))
  }
                              }
