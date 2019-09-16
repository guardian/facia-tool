package services.editions.publishing

import org.scalatest.{FunSuite, Matchers, TryValues}
import services.editions.QueueConnectorsFactory

import scala.util.Success

class IssuePublishEventsReaderTest extends FunSuite with Matchers with TryValues {

  import QueueConnectorsFactory._

  test("read and serialise events from queue") {

    def expectedCorrectSQSMessage = {
      val msg =
        """
          |{
          |  "Type" : "Notification",
          |  "MessageId" : "123",
          |  "TopicArn" : "topic-arn",
          |  "Message" : "{\"event\":{\"status\":\"Published\",\"message\":\"123\"}}",
          |  "Timestamp" : "2019-09-13T11:41:29.543Z",
          |  "SignatureVersion" : "1",
          |  "Signature" : "",
          |  "SigningCertURL" : "",
          |  "UnsubscribeURL" : ""
          |}
          |""".stripMargin

      new com.amazonaws.services.sqs.model.Message()
        .withBody(msg)
    }

    IssuePublishEventsReader(buildInMemoQueueConnector(List(expectedCorrectSQSMessage))).readPublishEvents shouldEqual Success(List(
      IssuePublishedEventWrapper(IssuePublishedEvent("Published", "123"))))

    IssuePublishEventsReader(buildInMemoQueueConnector(Nil)).readPublishEvents shouldEqual Success(Nil)
  }

  test("read events from queue adn indicate if message format was incorrect") {

    def expectedCorrectSQSMessage = {
      val msg =
        """
          |{
          |  "Type" : "Notification",
          |  "MessageId" : "123",
          |  "TopicArn" : "topic-arn",
          |  "Message" : "{\"event\":{\"statusss\":\"Published\",\"messageee\":\"123\"}}",
          |  "Timestamp" : "2019-09-13T11:41:29.543Z",
          |  "SignatureVersion" : "1",
          |  "Signature" : "",
          |  "SigningCertURL" : "",
          |  "UnsubscribeURL" : ""
          |}
          |""".stripMargin

      new com.amazonaws.services.sqs.model.Message()
        .withBody(msg)
    }

    IssuePublishEventsReader(buildInMemoQueueConnector(List(expectedCorrectSQSMessage))).readPublishEvents.isFailure shouldEqual true
  }

}
