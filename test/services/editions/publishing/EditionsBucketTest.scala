package services.editions.publishing

import java.time.LocalDate
import model.editions.{CuratedPlatform, Edition, EditionsIssue, PublishAction}
import services.editions.publishing.PublishedIssueFormatters._
import org.scalatest.{EitherValues, FreeSpec, Matchers, OptionValues}
import play.api.libs.json.Json
import services.editions.publishing.PublishedIssueFormatters._
import scala.io.Source

class EditionsBucketTest extends FreeSpec with Matchers with OptionValues with EitherValues {
  "Saving a publication to a bucket" - {
    val issueDate = LocalDate.of(2019, 9, 30)
    val issue: EditionsIssue = EditionsIssue(
      id = "4290573248905743296789524389623",
      edition = Edition.DailyEdition,
      timezoneId = "Europe/London",
      issueDate = issueDate,
      createdOn = 0,
      createdBy = "",
      createdEmail = "",
      launchedOn = None,
      launchedBy = None,
      launchedEmail = None,
      fronts = Nil,
      supportsProofing = true,
      platform = CuratedPlatform.Editions
    )

    "publication is preview" - {
      val previewIssue = issue.toPreviewIssue
      val key = EditionsBucket.createKey(previewIssue)
      val putObjectRequest = EditionsBucket.createPutObjectRequest("test-bucket", key, previewIssue)

      "key is correct" in {
        putObjectRequest.getKey shouldBe "daily-edition/2019-09-30/preview.json"
      }

      "bucket is correct" in {
        putObjectRequest.getBucketName shouldBe "test-bucket"
      }

      "data is correct" in {
        val actual = Source.fromInputStream(putObjectRequest.getInputStream).mkString
        val expectedJson = Json.stringify(Json.toJson(previewIssue))
        actual shouldBe expectedJson
      }
    }

    "publication is version called banana" - {
      val publishedIssue = issue.toPublishableIssue("banana", PublishAction.proof)
      val key = EditionsBucket.createKey(publishedIssue)
      val putObjectRequest = EditionsBucket.createPutObjectRequest("test-bucket", key, publishedIssue)

      "key is correct" in {
        putObjectRequest.getKey shouldBe "daily-edition/2019-09-30/banana.json"
      }

      "bucket is correct" in {
        putObjectRequest.getBucketName shouldBe "test-bucket"
      }

      "data is correct" in {
        val actual = Source.fromInputStream(putObjectRequest.getInputStream).mkString
        val expectedJson = Json.stringify(Json.toJson(publishedIssue))
        actual shouldBe expectedJson
      }
    }
  }
}
