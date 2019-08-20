package services.editions.publishing

import model.editions._
import play.api.libs.json.Json

object PublishedIssueFormatters {
  implicit val publishedImageWrites = Json.writes[PublishedImage]
  implicit val publishedCardImageWrites = Json.writes[PublishedCardImage]
  implicit val publishedFurnitureWrites = Json.writes[PublishedFurniture]
  implicit val publishedArticleWrites = Json.writes[PublishedArticle]
  implicit val publishedCollectionsWrites = Json.writes[PublishedCollection]
  implicit val publishedFrontsWrites = Json.writes[PublishedFront]
  implicit val publishedIssueWrites = Json.writes[PublishedIssue]
}
