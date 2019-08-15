package model.editions

import java.time.{OffsetDateTime, ZoneId, ZoneOffset, ZonedDateTime}

import org.scalatest.{FreeSpec, Matchers, OptionValues}

class PublishedIssueTest extends FreeSpec with Matchers with OptionValues {

  val LondonZone = ZoneId.of("Europe/London")
  val nowDateTime = ZonedDateTime.of(2019, 10, 11, 0, 0, 0, 0, LondonZone)
  val nowMilli = nowDateTime.toInstant.toEpochMilli

  private def issue(year: Int, month: Int, dom: Int, fronts: EditionsFront*): EditionsIssue = {
    val dateTime = ZonedDateTime.of(year, month, dom, 0, 0, 0, 0, LondonZone)
    val dateTimeMilli = dateTime.toInstant.toEpochMilli
    EditionsIssue(
      "test-edition",
      "Test Edition",
      LondonZone.toString,
      dateTimeMilli,
      dateTimeMilli,
      "User",
      "user@example.con",
      None,
      None,
      None,
      fronts.zipWithIndex.map{case (f, x) => f.copy(index=x)}.toList
    )
  }

  private def front(name: String, collections: EditionsCollection*): EditionsFront =
    EditionsFront(
      name,
      name,
      0,
      canRename = false,
      isHidden = false,
      None,
      None,
      None,
      None,
      collections.toList
    )

  implicit class RichEditionsFront(thisFront: EditionsFront) {
    def hide: EditionsFront = thisFront.copy(isHidden = true)
  }

  private def collection(name: String, prefill: Option[CapiPrefillQuery], articles: EditionsArticle*): EditionsCollection =
    EditionsCollection(
      name,
      name,
      isHidden = false,
      None,
      None,
      None,
      prefill,
      articles.toList
    )

  implicit class RichEditionsCollection(thisCollection: EditionsCollection) {
    def hide: EditionsCollection = thisCollection.copy(isHidden = true)
  }

  private def article(pageCode: String): EditionsArticle =
    EditionsArticle(
      pageCode,
      nowMilli,
      Some(ArticleMetadata.default)
    )

  "PublishedArticles" - {
    "article fields should be populated correctly" in {
      val now = OffsetDateTime.of(2019, 9, 30, 10, 23, 0, 0, ZoneOffset.ofHours(1))
      val article = EditionsArticle("1234456", now.toInstant.toEpochMilli, None)
      val publishedArticle = article.toPublishedArticle
      publishedArticle.internalPageCode shouldBe 1234456
      publishedArticle.furniture shouldBe PublishedFurniture(None, None, None, None, false, false, PublishedMediaType.UseArticleTrail, None, None)
    }

    "furniture defaults should be populated correctly" in {
      val furniture = ArticleMetadata(None, None, None, None, None, None, None, None, None, None)
      val article = EditionsArticle("123456", 0, Some(furniture))
      val published = article.toPublishedArticle

      published.furniture shouldBe PublishedFurniture(None, None, None, None, false, false, PublishedMediaType.UseArticleTrail, None, None)
    }

    "furniture should be populated when specified" in {
      val furniture = ArticleMetadata(
        Some("headline"),
        Some("kicker"),
        Some("trail-text"),
        Some(true),
        Some(true),
        Some("byline"),
        Some("sport-score"),
        Some(MediaType.Image),
        None,
        Some(Image(Some(100), Some(100), "file://image-1.gif", "file://image-1.jpg"))
      )
      val article = EditionsArticle("123456", 0, Some(furniture))
      val published = article.toPublishedArticle

      published.furniture shouldBe PublishedFurniture(
        Some("kicker"),
        Some("headline"),
        Some("trail-text"),
        Some("byline"),
        showByline = true,
        showQuotedHeadline = true,
        mediaType = PublishedMediaType.Image,
        imageSrcOverride = Some(PublishedImage(Some(100), Some(100), "file://image-1.jpg")),
        sportScore = Some("sport-score")
      )
    }
  }

  "PublishedIssue" - {
    "fronts should be filtered out when hidden" in {
      val testIssue = issue(2019, 9, 30,
        front("uk-news",
          collection("london", None),
          collection("financial", None)
        ),
        front("culture",
          collection("art", None),
          collection("theatre", None)
        ),
        front("special",
          collection("magic", None)
        ).hide
      )
      testIssue.fronts.size shouldBe 3
      val publishedIssue = testIssue.toPublishedIssue(None)
      publishedIssue.fronts.size shouldBe 2
      publishedIssue.fronts.find(_.name == "special") shouldBe None
    }
  }

  "PublishedFront" - {
    "collections should be filtered out when hidden" in {
      val testFront = front("uk-news",
        collection("london", None),
        collection("financial", None),
        collection("special", None).hide,
        collection("weather", None)
      )

      testFront.collections.size shouldBe 4
      testFront.collections.find(_.id == "special").value

      val publishedFront = testFront.toPublishedFront
      publishedFront.collections.size shouldBe 3
      publishedFront.collections.find(_.id == "special") shouldBe None
    }

    "Fronts should not override name if there's not one defined" in {
      val front = EditionsFront(
        "id",
        "Original Name",
        0,
        false,
        false,
        None,
        None,
        None,
        Some(EditionsFrontMetadata(None, None)),
        Nil)

      val published = front.toPublishedFront

      published shouldBe PublishedFront("id", "Original Name", Nil, Swatch.Neutral)
    }

    "Front name should be overriden correctly" in {
      val front = EditionsFront(
        "id",
        "Original Name",
        0,
        false,
        false,
        None,
        None,
        None,
        Some(EditionsFrontMetadata(Some("New Name"), None)),
        Nil)

      val published = front.toPublishedFront

      published shouldBe PublishedFront("id", "New Name", Nil, Swatch.Neutral)
    }
  }
}
