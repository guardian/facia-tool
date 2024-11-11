package services.editions.publishing

import model.editions._
import play.api.libs.json.{Json, OWrites}

object PublishedIssueFormatters {
  implicit val publishedImageWrites: OWrites[PublishedImage] =
    Json.writes[PublishedImage]
  implicit val publishedCardImageWrites: OWrites[PublishedCardImage] =
    Json.writes[PublishedCardImage]
  implicit val publishedFurnitureWrites: OWrites[PublishedFurniture] =
    Json.writes[PublishedFurniture]
  implicit val publishedArticleWrites: OWrites[PublishedArticle] =
    Json.writes[PublishedArticle]
  implicit val publishedCollectionsWrites: OWrites[PublishedCollection] =
    Json.writes[PublishedCollection]
  implicit val publishedFrontsWrites: OWrites[PublishedFront] =
    Json.writes[PublishedFront]
  implicit val publishedIssueWrites: OWrites[PublishableIssue] =
    Json.writes[PublishableIssue]
}
