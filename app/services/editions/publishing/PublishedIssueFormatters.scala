package services.editions.publishing

import model.editions._
import play.api.libs.json.Json

object PublishedIssueFormatters {
  implicit val publishedImageFormat = Json.format[PublishedImage]
  implicit val publishedFurnitureFormat = Json.format[PublishedFurniture]
  implicit val publishedArticleFormat = Json.format[PublishedArticle]
  implicit val publishedCollectionsFormat = Json.format[PublishedCollection]
  implicit val publishedFrontsFormat = Json.format[PublishedFront]
  implicit val publishedIssueFormat = Json.format[PublishedIssue]
}
