package model.editions

import java.time.LocalDate

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json
import services.editions.publishing.PublishedIssueFormatters._

class PublishedIssueSerialisationTest extends FreeSpec with Matchers {
  "EditionsIssueTest" - {
    val issueDate = LocalDate.of(2019, 9, 30)

    val issue: EditionsIssue = EditionsIssue(
      id = "4290573248905743296789524389623",
      edition = Edition.DailyEdition,
      platform = CuratedPlatform.Editions,
      timezoneId = "Europe/London",
      issueDate = issueDate,
      createdOn = 0,
      createdBy = "",
      createdEmail = "",
      launchedOn = None,
      launchedBy = None,
      launchedEmail = None,
      fronts = Nil,
      supportsProofing = true
    )

    "test serialisation into a preview issue" in {
      val expectedJson =
        """{
          |  "action" : "preview",
          |  "id" : "4290573248905743296789524389623",
          |  "name" : "daily-edition",
          |  "edition" : "daily-edition",
          |  "issueDate" : "2019-09-30",
          |  "version" : "preview",
          |  "fronts" : [ ],
          |  "notificationUTCOffset" : 3,
          |  "topic" : "uk"
          |}""".stripMargin

      val previewIssue = issue.toPreviewIssue
      val json = Json.prettyPrint(Json.toJson(previewIssue))

      json shouldBe expectedJson
    }

    "test serialisation into a proof issue" in {
      val expectedJson =
        """{
          |  "action" : "proof",
          |  "id" : "4290573248905743296789524389623",
          |  "name" : "daily-edition",
          |  "edition" : "daily-edition",
          |  "issueDate" : "2019-09-30",
          |  "version" : "foo",
          |  "fronts" : [ ],
          |  "notificationUTCOffset" : 3,
          |  "topic" : "uk"
          |}""".stripMargin

      val publishedIssue = issue.toPublishableIssue("foo", PublishAction.proof)
      val json = Json.prettyPrint(Json.toJson(publishedIssue))

      json shouldBe expectedJson
    }

    "test serialisation of a published collection" in {
      val expectedJson =
        """{
          |  "id" : "id",
          |  "name" : "Display Name",
          |  "items" : [ ]
          |}""".stripMargin

      val collection = PublishedCollection("id", "Display Name", Nil)
      val json = Json.prettyPrint(Json.toJson(collection))

      json shouldBe expectedJson
    }

    "test serialisation of card furniture" - {
      "should output all the fields in the format expected by the editions backend" in {
        val expectedJson =
          """{
            |  "internalPageCode" : 1234567,
            |  "furniture" : {
            |    "kicker" : "KickeR!",
            |    "headlineOverride" : "a nice headline",
            |    "trailTextOverride" : "an even lovelier trail for the article",
            |    "bylineOverride" : "Monkey In Charge",
            |    "showByline" : true,
            |    "showQuotedHeadline" : false,
            |    "mediaType" : "cutout",
            |    "imageSrcOverride" : {
            |      "height" : 1280,
            |      "width" : 720,
            |      "src" : "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
            |    },
            |    "sportScore" : "Sport Score",
            |    "overrideArticleMainMedia" : true,
            |    "coverCardImages" : {
            |      "mobile" : {
            |        "height" : 1337,
            |        "width" : 1337,
            |        "src" : "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
            |      },
            |      "tablet" : {
            |        "height" : 1337,
            |        "width" : 1337,
            |        "src" : "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
            |      }
            |    }
            |  }
            |}""".stripMargin

        val article = PublishedArticle(
          1234567L,
          PublishedFurniture(
            kicker = Some("KickeR!"),
            headlineOverride = Some("a nice headline"),
            trailTextOverride = Some("an even lovelier trail for the article"),
            bylineOverride = Some("Monkey In Charge"),
            sportScore = Some("Sport Score"),
            showByline = true,
            showQuotedHeadline = false,
            mediaType = PublishedMediaType.Cutout,
            imageSrcOverride = Some(
              PublishedImage(
                height = Some(1280),
                width = Some(720),
                "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
              )
            ),
            overrideArticleMainMedia = true,
            coverCardImages = Some(
              PublishedCardImage(
                mobile = PublishedImage(
                  height = Some(1337),
                  width = Some(1337),
                  "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
                ),
                tablet = PublishedImage(
                  height = Some(1337),
                  width = Some(1337),
                  "https://media.giphy.com/media/yV5iknckcXcc/source.gif"
                )
              )
            )
          )
        )

        val json = Json.prettyPrint(Json.toJson(article))

        json shouldBe expectedJson
      }
    }
  }
}
