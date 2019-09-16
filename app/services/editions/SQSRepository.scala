package services.editions

import com.amazonaws.regions.Regions
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.{Message, ReceiveMessageRequest}
import conf.ApplicationConfiguration

import scala.collection.JavaConverters._

object QueueConnectorsFactory {

  def buildSQSConnector(config: ApplicationConfiguration, queueURL: String) = new SQSConnector(config, queueURL)

  def buildInMemoQueueConnector(records: List[Message]) = new InMemoQueueConnector(records)
}

trait QueueConnector {
  def receiveMessages: List[Message]
}

class SQSConnector(val config: ApplicationConfiguration, val queueURL: String) extends QueueConnector {

  private lazy val SQS = AmazonSQSAsyncClientBuilder.standard()
    .withCredentials(config.aws.cmsFrontsAccountCredentials)
    .withRegion(Regions.EU_WEST_1).build()

  override def receiveMessages: List[Message] = {
    val receiveRequest = new ReceiveMessageRequest()
      .withQueueUrl(queueURL)
      .withWaitTimeSeconds(20)
    SQS.receiveMessage(receiveRequest)
      .getMessages.asScala.toList
  }

}

class InMemoQueueConnector(queue: List[Message]) extends QueueConnector {
  override def receiveMessages: List[Message] = queue
}
