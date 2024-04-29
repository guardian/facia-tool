package services.editions.publishing

import com.amazonaws.services.sns.AmazonSNSClient
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest, PublishResult}
import conf.ApplicationConfiguration
import model.editions.PublishableIssue
import org.mockito.Mockito._
import org.mockito.ArgumentMatchers._
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import play.api.Configuration
import play.api.libs.json.Json
import services.editions.publishing.transform.FeastAppModel.{Chef, FeastAppContainer, FeastAppCuration, Recipe, RecipeIdentifier}
import util.TimestampGenerator

import scala.jdk.CollectionConverters._
import scala.util.{Failure, Try}

class FeastPublicationTargetTest extends FreeSpec with Matchers with MockitoSugar {
  val conf = new ApplicationConfiguration(
    Configuration.from(Map(
      "aws.region"->"eu-west-1",
      "feast_app.publication_topic" -> "fake-publication-topic"
    )),
    false
  )

  val mockTSG = mock[TimestampGenerator]
  when(mockTSG.getTimestamp).thenReturn(12345678L)

  "putIssueJson" - {
    val issue = Map(
      "chefs" -> FeastAppContainer("chefs", "Chefs", None, Seq(Chef(None, "bob-the-pirate", None, "Bob is a pirate", None))),
      "recipes" -> FeastAppContainer("recipes", "Recipes", None, Seq(Recipe(RecipeIdentifier("abcdefg"))))
    )

    "should push the relevant content into SNS" - {
      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      val expectedBody = Json.toJson(issue)
      toTest.putIssueJson(issue, "test-key")

      val expectedRequest = new PublishRequest()
        .withTopicArn("fake-publication-topic")
        .withMessage(expectedBody.toString())
        .withMessageAttributes(Map(
          "type"->new MessageAttributeValue().withDataType("String").withStringValue("Issue"),
          "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue("12345678")
        ).asJava)
      verify(mockSNS, times(1)).publish(expectedRequest)
    }

    "should not catch an SNS exception" - {
      val mockSNS = mock[AmazonSNSClient]
      val except = new RuntimeException("My hovercraft is full of eels")
      when(mockSNS.publish(any[PublishRequest])).thenThrow(except)

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      val result = Try { toTest.putIssueJson(issue, "test-key") }
      result should equal(Failure(except))
    }
  }

  "putEditionsList" - {
    "should push the relevant content into SNS" - {
      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      toTest.putEditionsList("blahblahblah")

      val expectedRequest = new PublishRequest()
        .withTopicArn("fake-publication-topic")
        .withMessage("blahblahblah")
        .withMessageAttributes(Map(
          "type"->new MessageAttributeValue().withDataType("String").withStringValue("EditionsList"),
          "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue("12345678")
        ).asJava)

      verify(mockSNS, times(1)).publish(expectedRequest)
    }
  }
}
