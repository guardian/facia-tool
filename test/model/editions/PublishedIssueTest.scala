package model.editions

import java.time.{OffsetDateTime, ZoneOffset}

import org.scalatest.{FreeSpec, Matchers}

class PublishedIssueTest extends FreeSpec with Matchers {
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
}