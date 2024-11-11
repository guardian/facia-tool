package services.editions.publishing.events

import java.time.{LocalDate, LocalDateTime}

import model.editions.{Edition, IssueVersionStatus}
import org.scalatest.{FunSuite, Matchers}

class PublishEventSNSMessageParserTest extends FunSuite with Matchers {

  test("serialise and parse sqs message to IssuePublishedEvent") {

    def correctSQSMessagefromSNS = {
      val msg =
        """
          |{
          |  "Type" : "Notification",
          |  "MessageId" : "123",
          |  "TopicArn" : "topic-arn",
          |  "Message" : "{\"event\":{\"edition\":\"daily-edition\",\"version\":\"2019-10-04T14:57:48.163Z\",\"issueDate\":\"2019-10-04\",\"status\":\"Published\",\"message\":\"Publication processing complete\",\"timestamp\":\"2019-10-04T14:59:53+00:00\"}}",
          |  "Timestamp" : "2019-09-13T11:41:29.543Z",
          |  "SignatureVersion" : "1",
          |  "Signature" : "r3nbjep",
          |  "SigningCertURL" : "https://signin.pem",
          |  "UnsubscribeURL" : "https://unsubscribe"
          |}
          |""".stripMargin

      new com.amazonaws.services.sqs.model.Message()
        .withBody(msg)
        .withReceiptHandle("ReceiptHandle1")
    }

    val expected = PublishEventMessage(
      "ReceiptHandle1",
      PublishEvent(
        edition = Edition.DailyEdition,
        version = "2019-10-04T14:57:48.163Z",
        issueDate = LocalDate.of(2019, 10, 4),
        status = IssueVersionStatus.Published,
        message = "Publication processing complete",
        timestamp = LocalDateTime.of(2019, 10, 4, 14, 59, 53)
      )
    )

    PublishEventSNSMessageParser.parseToEvent(
      correctSQSMessagefromSNS
    ) shouldEqual Some(expected)
  }

  test("indicate if message format was incorrect") {

    def incorrectCorrectSQSMessageFromSNS = {
      val msg =
        """
          |{
          |  "Type" : "Notification",
          |  "MessageId" : "123",
          |  "TopicArn" : "topic-arn",
          |  "Message" : "{\"event\":{\"statusss\":\"Published\",\"messageee\":\"123\"}}",
          |  "Timestamp" : "2019-09-13T11:41:29.543Z",
          |  "SignatureVersion" : "1",
          |  "Signature" : "r3nbjep",
          |  "SigningCertURL" : "https://signin.pem",
          |  "UnsubscribeURL" : "https://unsubscribe"
          |}
          |""".stripMargin

      new com.amazonaws.services.sqs.model.Message()
        .withBody(msg)
    }

    PublishEventSNSMessageParser.parseToEvent(
      incorrectCorrectSQSMessageFromSNS
    ) shouldEqual None
  }

}
