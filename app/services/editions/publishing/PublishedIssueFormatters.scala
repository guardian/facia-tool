package services.editions.publishing

import com.gu.editions._
import play.api.libs.json.Json

object PublishedIssueFormatters {
  implicit val publishedArticleMetadataFormat = Json.format[PublishedArticleMetadata]
  implicit val publishedArticleFormat = Json.format[PublishedArticle]
  implicit val publishedCollectionsFormat = Json.format[PublishedCollection]
  implicit val publishedFrontsFormat = Json.format[PublishedFront]
  implicit val publishedIssueFormat = Json.format[PublishedIssue]
}
