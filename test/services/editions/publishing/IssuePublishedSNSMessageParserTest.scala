package services.editions.publishing

import org.scalatest.{FunSuite, Matchers}

class IssuePublishedSNSMessageParserTest extends FunSuite with Matchers {

  test("serialise and parse sqs message to IssuePublishedEvent") {

    def correctSQSMessagefromSNS = {
      val msg =
        """
          |{
          |  "Type" : "Notification",
          |  "MessageId" : "123",
          |  "TopicArn" : "topic-arn",
          |  "Message" : "{\"event\":{\"status\":\"Published\",\"message\":\"123\"}}",
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

    IssuePublishedSNSMessageParser.parseToEvent(correctSQSMessagefromSNS) shouldEqual Some(
      PublishEventMessage("ReceiptHandle1", PublishedEvent("Published", "123")))
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

    IssuePublishedSNSMessageParser.parseToEvent(incorrectCorrectSQSMessageFromSNS) shouldEqual None
  }

}
