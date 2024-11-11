package services.editions.publishing.events

import com.amazonaws.regions.Regions
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.{Message, ReceiveMessageRequest}
import conf.ApplicationConfiguration
import logging.Logging
import services.editions.publishing.events.PublishEventSNSMessageParser.parseToEvent

import scala.jdk.CollectionConverters._
import scala.util.{Failure, Success, Try}

private[events] trait PublishEventsQueueFacade {
  def getPublishEventFromQueue: Option[PublishEventMessage]

  def delete(receiptHandle: String): Unit
}

private[events] object PublishEventsSQSFacade {
  def apply(config: ApplicationConfiguration): PublishEventsSQSFacade =
    new PublishEventsSQSFacade(config)
}

private[events] class PublishEventsSQSFacade(
    val config: ApplicationConfiguration
) extends PublishEventsQueueFacade
    with Logging {

  private val maxNumberOfSQSMessagesPerReceiveReq = 1
  private val sqsClientLongPoolingWaitTimeSec = 15
  private val queueURL = config.faciatool.publishEventsQueue

  private lazy val SQS = AmazonSQSAsyncClientBuilder
    .standard()
    .withCredentials(config.aws.cmsFrontsAccountCredentials)
    .withRegion(Regions.EU_WEST_1)
    .build()

  def getPublishEventFromQueue: Option[PublishEventMessage] =
    receiveMessage.flatMap(parseToEvent)

  def delete(receiptHandle: String): Unit = {
    Try {
      SQS.deleteMessageAsync(queueURL, receiptHandle)
    } match {
      case Success(messages) =>
        logger.info(
          s"message with receiptHandle: $receiptHandle deleted successfully from SQS"
        )
      case Failure(e) =>
        logger.error(
          s"There was an exception while deleting message with receiptHandle: $receiptHandle " +
            s"from $queueURL SQS: ${e.getMessage}",
          e
        )
    }
  }

  private def receiveMessage: Option[Message] = {
    Try {
      val receiveRequest = new ReceiveMessageRequest()
        .withQueueUrl(queueURL)
        .withMaxNumberOfMessages(maxNumberOfSQSMessagesPerReceiveReq)
        .withWaitTimeSeconds(sqsClientLongPoolingWaitTimeSec)

      SQS.receiveMessage(receiveRequest).getMessages.asScala.toList
    } match {
      case Success(messageList) =>
        if (messageList.isEmpty) {
          logger.info(s"no messages available on $queueURL")
          None
        } else {
          logger.info(s"message received from $queueURL SQS successfully")
          Some(messageList.head)
        }
      case Failure(e) =>
        logger.error(
          s"There was an exception while receiving messages from $queueURL SQS: ${e.getMessage} from SQS",
          e
        )
        None
    }
  }

}
