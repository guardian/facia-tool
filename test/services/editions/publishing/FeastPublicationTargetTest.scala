package services.editions.publishing

import com.amazonaws.services.sns.AmazonSNSClient
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest, PublishResult}
import conf.ApplicationConfiguration
import model.FeastAppModel
import model.editions.{CuratedPlatform, Edition, EditionsCollection, EditionsFront, EditionsIssue, EditionsRecipe, PublishAction}
import org.mockito.Mockito._
import org.mockito.ArgumentMatchers._
import org.scalatest.{FreeSpec, Matchers}
import org.scalatestplus.mockito.MockitoSugar
import play.api.Configuration
import play.api.libs.json.Json
import model.FeastAppModel.{Chef, FeastAppContainer, Recipe, RecipeIdentifier}
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

  val testIssue = EditionsIssue(
    id = "123456ABCD",
    edition = Edition.FeastNorthernHemisphere,  //?? ma
    platform = CuratedPlatform.Feast,
    timezoneId = "Europe/London",
    issueDate = LocalDate.of(2024,5,3),
    createdOn = 0L,
    createdBy = "test",
    createdEmail = "test@test.com",
    launchedOn = None,
    launchedBy = None,
    launchedEmail = None,
    supportsProofing = false,
    fronts = List(
      EditionsFront(
        "b09354b1-f971-4d08-961b-dc83004c6b1f",
        "All Recipes",
        index = 0,
        isSpecial = false, // :(
        isHidden = false,
        updatedOn = None,
        updatedBy = None,
        updatedEmail = None,
        metadata = None,
        collections = List(
          EditionsCollection(
            id="98e89761-fdf0-4903-b49d-2af7d66fc930",
            displayName="Dish of the day",
            isHidden =  false,
            lastUpdated = None,
            updatedBy = None,
            updatedEmail = None,
            prefill = None,
            contentPrefillTimeWindow = None,
            items=List(
              EditionsRecipe(
                "id",
                0L
              )
            )
          )
        )
      )
    )
  )

  val mockTSG = mock[TimestampGenerator]
  when(mockTSG.getTimestamp).thenReturn(12345678L)

  "putIssueJson" - {
    val issue = Map(
      "chefs" -> FeastAppContainer("chefs", "Chefs", None, Seq(Chef("bob-the-pirate", None, Some("Bob is a pirate"), None, None))),
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
      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      val result = toTest.transformContent(testIssue, "v1")
      result.fronts.contains("all-recipes") shouldBe true
      val allRecipesFront = result.fronts("all-recipes")
      allRecipesFront.length shouldBe 1
      allRecipesFront.head.title shouldBe "Dish of the day"
      allRecipesFront.head.body shouldBe Some("") //this is just how the `body` field is currently rendered
      allRecipesFront.head.id shouldBe "98e89761-fdf0-4903-b49d-2af7d66fc930"
      allRecipesFront.head.items.length shouldBe 1
      allRecipesFront.head.items.head.asInstanceOf[FeastAppModel.Recipe].recipe.id shouldBe "id"
    }
  }

  "putIssue" - {
    "should output the transformed version of the content" - {
      val serializedVersion = """{"id":"123456ABCD","edition":"feast-northern-hemisphere","issueDate":"2024-05-03","version":"v1","fronts":{"all-recipes":[{"id":"98e89761-fdf0-4903-b49d-2af7d66fc930","title":"Dish of the day","body":"","items":[{"recipe":{"id":"id"}}]}]}}"""

      val mockSNS = mock[AmazonSNSClient]
      when(mockSNS.publish(any[PublishRequest])).thenReturn(new PublishResult())

      val toTest = new FeastPublicationTarget(mockSNS, conf, mockTSG)

      toTest.putIssue(testIssue, "v1", PublishAction.publish)
      val expectedRequest = new PublishRequest()
        .withTopicArn("fake-publication-topic")
        .withMessage(serializedVersion)
        .withMessageAttributes(Map(
          "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue("12345678"),
          "type"->new MessageAttributeValue().withDataType("String").withStringValue("Issue")
        ).asJava)
      verify(mockSNS).publish(expectedRequest)
    }
  }
}
