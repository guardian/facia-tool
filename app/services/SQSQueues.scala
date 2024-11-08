package services

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.services.sqs.AmazonSQSAsync
import com.amazonaws.services.sqs.model._
import play.api.libs.json.{Json, Writes}

import java.util.concurrent.{Future => JavaFuture}
import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success}

object SQSQueues {
  implicit class RichAmazonSQSAsyncClient(client: AmazonSQSAsync) {
    private def createHandler[
        A <: com.amazonaws.AmazonWebServiceRequest,
        B
    ]() = {
      val promise = Promise[B]()

      val handler = new AsyncHandler[A, B] {
        override def onSuccess(request: A, result: B): Unit =
          promise.complete(Success(result))

        override def onError(exception: Exception): Unit =
          promise.complete(Failure(exception))
      }

      (promise.future, handler)
    }

    private def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](
        f: AsyncHandler[A, B] => JavaFuture[B]
    ) = {
      val (future, handler) = createHandler[A, B]()
      f(handler)
      future
    }

    def sendMessageFuture(
        request: SendMessageRequest
    ): Future[SendMessageResult] =
      asFuture[SendMessageRequest, SendMessageResult](
        client.sendMessageAsync(request, _)
      )
  }
}

/** Utility class for SQS queues that use JSON to serialize their messages */
case class JsonMessageQueue[A](client: AmazonSQSAsync, queueUrl: String)(
    implicit executionContext: ExecutionContext
) {
  import SQSQueues._

  def send(a: A)(implicit writes: Writes[A]): Future[SendMessageResult] = {
    client.sendMessageFuture(
      new SendMessageRequest()
        .withQueueUrl(queueUrl)
        .withMessageBody(Json.stringify(Json.toJson(a)))
    )
  }
}
