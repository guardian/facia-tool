package editions

import java.time.{OffsetDateTime, ZoneOffset}

import com.gu.editions.PublishedFurniture
import model.editions.{ArticleMetadata, EditionsArticle}
import org.scalatest.{FreeSpec, Matchers}

class PublishedIssueTest extends FreeSpec with Matchers {
  "PublishedArticles" - {
    "article fields should be populated correctly" in {
      val now = OffsetDateTime.of(2019, 9, 30, 10, 23, 0, 0, ZoneOffset.ofHours(1))
      val article = EditionsArticle("1234456", now.toInstant.toEpochMilli, None)
      val publishedArticle = article.toPublishedArticle
      publishedArticle.internalPageCode shouldBe 1234456
      publishedArticle.furniture shouldBe PublishedFurniture(None, None, None, None, false, false, None)
    }

    "furniture defaults should be populated correctly" in {
      val furniture = ArticleMetadata(None, None, None, None, None, None, None, None, None, None)
      val article = EditionsArticle("123456", 0, Some(furniture))
      val published = article.toPublishedArticle

      published.furniture shouldBe PublishedFurniture(None, None, None, None, false, false, None)
    }

    "furniture should be populated when specified" in {
      val furniture = ArticleMetadata(
        Some("headline"),
        Some("kicker"),
        Some("trail-text"),
        Some(true),
        Some(true),
        Some("byline"),
        None, None, None, None
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
        imageSrcOverride = None
      )

    }
  }
}
