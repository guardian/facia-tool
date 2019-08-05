package model.editions

import java.time.{LocalDate, OffsetDateTime, OffsetTime, ZoneOffset}

import org.scalatest.{FreeSpec, Matchers}
import play.api.libs.json.Json
import services.editions.publishing.PublishedIssueFormatters._

class PublishedIssueSerialisationTest extends FreeSpec with Matchers {
  "EditionsIssueTest" - {
    val midnight = OffsetTime.of(0, 0, 0, 0, ZoneOffset.UTC)
    val issueDate = LocalDate.of(2019, 9, 30).atTime(midnight)

    val issue: EditionsIssue = EditionsIssue(
      id = "4290573248905743296789524389623",
      displayName = "Daily Edition",
      timezoneId = "Europe/London",
      issueDate = issueDate.toInstant.toEpochMilli,
      createdOn = 0,
      createdBy = "",
      createdEmail = "",
      launchedOn = None,
      launchedBy = None,
      launchedEmail = None,
      fronts = Nil
    )

    "test serialisation into a preview issue" in {
      val expectedJson =
        """{
          |  "id" : "4290573248905743296789524389623",
          |  "name" : "Daily Edition",
          |  "issueDate" : "2019-09-30T01:00:00+01:00",
          |  "fronts" : [ ]
          |}""".stripMargin

      val previewIssue = issue.toPublishedIssue()
      val json = Json.prettyPrint(Json.toJson(previewIssue))

      json shouldBe expectedJson
    }

    "test serialisation into a published issue" in {
      val expectedJson =
        """{
          |  "id" : "4290573248905743296789524389623",
          |  "name" : "Daily Edition",
          |  "issueDate" : "2019-09-30T01:00:00+01:00",
          |  "version" : "foo",
          |  "fronts" : [ ]
          |}""".stripMargin

      val publishedIssue = issue.toPublishedIssue(Some("foo"))
      val json = Json.prettyPrint(Json.toJson(publishedIssue))

      json shouldBe expectedJson
    }

    "test serialisation of article furniture" - {
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
            |    "slideshowImages" : [ {
            |      "height" : 1280,
            |      "width" : 720,
            |      "src" : "https://media.giphy.com/media/TLulTJKuyLgMU/source.gif"
            |    }, {
            |      "height" : 1280,
            |      "width" : 720,
            |      "src" : "https://media.giphy.com/media/GuWSJPF6bEkKs/source.gif"
            |    } ]
            |  }
            |}""".stripMargin

        val article = PublishedArticle(1234567L, PublishedFurniture(
          kicker = Some("KickeR!"),
          headlineOverride = Some("a nice headline"),
          trailTextOverride = Some("an even lovelier trail for the article"),
          bylineOverride = Some("Monkey In Charge"),
          showByline = true,
          showQuotedHeadline = false,
          mediaType = PublishedMediaType.Cutout,
          imageSrcOverride = Some(
            PublishedImage(height = 1280, width = 720, "https://media.giphy.com/media/yV5iknckcXcc/source.gif")
          ),
          slideshowImages = Some(List(
            PublishedImage(height = 1280, width = 720, "https://media.giphy.com/media/TLulTJKuyLgMU/source.gif"),
            PublishedImage(height = 1280, width = 720, "https://media.giphy.com/media/GuWSJPF6bEkKs/source.gif")
          ))
        ))

        val json = Json.prettyPrint(Json.toJson(article))

        json shouldBe expectedJson
      }
    }
  }
}
