package model.editions

import model.editions.client.ClientArticleMetadata
import play.api.libs.json.{Json, OFormat}

// Ideally the frontend can be changed so we don't have this weird modelling!

case class EditionsClientArticle(id: String, frontPublicationDate: Long, meta: Option[ClientArticleMetadata])

object EditionsClientArticle {
  def fromArticle(article: EditionsArticle): EditionsClientArticle = {
    EditionsClientArticle(
      "internal-code/page/" + article.pageCode,
      article.addedOn,
      article.metadata.map(ClientArticleMetadata.fromArticleMetadata)
    )
  }
  def toArticle(article: EditionsClientArticle): EditionsArticle = {
    EditionsArticle(
      article.id.split("/").last,
      article.frontPublicationDate,
      article.meta.map(_.toArticleMetadata)
    )
  }
}

case class EditionsClientCollection(
  id: String,
  displayName: String,
  isHidden: Boolean,
  lastUpdated: Option[Long],
  updatedBy: Option[String],
  updatedEmail: Option[String],
  prefill: Option[CapiPrefillQuery],
  items: List[EditionsClientArticle]
)
case class EditionsFrontendCollectionWrapper(id: String, collection: EditionsClientCollection)

object EditionsFrontendCollectionWrapper {
  implicit def articleFormat: OFormat[EditionsClientArticle] = Json.format[EditionsClientArticle]
  implicit def collectionFormat: OFormat[EditionsClientCollection] = Json.format[EditionsClientCollection]
  implicit def collectionWrapperFormat: OFormat[EditionsFrontendCollectionWrapper] = Json.format[EditionsFrontendCollectionWrapper]

  def fromCollection(collection: EditionsCollection): EditionsFrontendCollectionWrapper = {
    EditionsFrontendCollectionWrapper(
      collection.id,
      EditionsClientCollection(
        collection.id,
        collection.displayName,
        collection.isHidden,
        collection.lastUpdated,
        collection.updatedBy,
        collection.updatedEmail,
        collection.prefill,
        collection.items.map(EditionsClientArticle.fromArticle)
      )
    )
  }

  def toCollection(frontendCollection: EditionsFrontendCollectionWrapper): EditionsCollection = {
    EditionsCollection(
      frontendCollection.id,
      frontendCollection.collection.displayName,
      frontendCollection.collection.isHidden,
      frontendCollection.collection.lastUpdated,
      frontendCollection.collection.updatedBy,
      frontendCollection.collection.updatedEmail,
      frontendCollection.collection.prefill,
      frontendCollection.collection.items.map(EditionsClientArticle.toArticle)
    )
  }
}
