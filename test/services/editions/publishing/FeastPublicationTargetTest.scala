package services.editions.publishing

import com.amazonaws.services.sns.AmazonSNSClient
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest, PublishResult}
import conf.ApplicationConfiguration
import model.FeastAppModel
import model.editions.{Edition, PublishAction, PublishableIssue, PublishedArticle, PublishedCollection, PublishedFront}
import org.mockito.Mockito._
import org.mockito.ArgumentMatchers._
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import play.api.Configuration
import play.api.libs.json.Json
import model.FeastAppModel.{Chef, FeastAppContainer, FeastAppCuration, Recipe, RecipeIdentifier}
import util.TimestampGenerator

import java.time.LocalDate
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

  "transformContent" - {
    "should transform the Editions content" - {
      val incoming = PublishableIssue(
        PublishAction.publish,
        "123456ABCD",
        Edition.FeastNorthernHemisphere,  //?? maybe a modelling mistake here
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2024,5,3),
        "v1",
        fronts=List(
          PublishedFront("b09354b1-f971-4d08-961b-dc83004c6b1f","All Recipes",
            swatch=null,
            collections=List(
              PublishedCollection(
                id="98e89761-fdf0-4903-b49d-2af7d66fc930",
                name="Dish of the day",
                items=List(
                  PublishedArticle(
                    internalPageCode = 123456,
                    null
                  )
                )
              )
            )
          )
        ),
        notificationUTCOffset=0,
        topic=None
      )

      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      val result = toTest.transformContent(incoming)
      result.fronts.contains("all-recipes") shouldBe true
      val allRecipesFront = result.fronts("all-recipes")
      allRecipesFront.length shouldBe 1
      allRecipesFront.head.title shouldBe "Dish of the day"
      allRecipesFront.head.body shouldBe Some("") //this is just how the `body` field is currently rendered
      allRecipesFront.head.id shouldBe "98e89761-fdf0-4903-b49d-2af7d66fc930"
      allRecipesFront.head.items.length shouldBe 1
      allRecipesFront.head.items.head.asInstanceOf[FeastAppModel.Recipe].recipe.id shouldBe "123456"
    }
  }

  "putIssue" - {
    "should output the transformed version of the content" - {
      val incoming = PublishableIssue(
        PublishAction.publish,
        "123456ABCD",
        Edition.FeastNorthernHemisphere,  //?? maybe a modelling mistake here
        Edition.FeastNorthernHemisphere,
        LocalDate.of(2024,5,3),
        "v1",
        fronts=List(
          PublishedFront("b09354b1-f971-4d08-961b-dc83004c6b1f","All Recipes",
            swatch=null,
            collections=List(
              PublishedCollection(
                id="98e89761-fdf0-4903-b49d-2af7d66fc930",
                name="Dish of the day",
                items=List(
                  PublishedArticle(
                    internalPageCode = 123456,
                    null
                  )
                )
              )
            )
          )
        ),
        notificationUTCOffset=0,
        topic=None
      )

      val serializedVersion = """{"id":"123456ABCD","edition":"feast-northern-hemisphere","issueDate":"2024-05-03","version":"v1","fronts":{"all-recipes":[{"id":"98e89761-fdf0-4903-b49d-2af7d66fc930","title":"Dish of the day","body":"","items":[{"recipe":{"id":"123456"}}]}]}}"""

      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      toTest.putIssue(incoming, Some("test-key"))
      val expectedRequest = new PublishRequest()
        .withTopicArn("fake-publication-topic")
        .withMessage(serializedVersion)
        .withMessageAttributes(Map(
          "type"->new MessageAttributeValue().withDataType("String").withStringValue("Issue"),
          "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue("12345678")
        ).asJava)
      verify(mockSNS).publish(expectedRequest)
    }
  }

}
