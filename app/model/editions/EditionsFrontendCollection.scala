package model.editions

import play.api.libs.json.Json

// Ideally the frontend can be changed so we don't have this weird modelling!

case class EditionsFrontendArticle(id: String, frontPublicationDate: Long, meta: Option[ArticleMetadata])

object EditionsFrontendArticle {
  def fromArticle(article: EditionsArticle): EditionsFrontendArticle = {
    EditionsFrontendArticle(
      "internal-code/page/" + article.pageCode,
      article.addedOn,
      article.metadata
    )
  }
  def toArticle(article: EditionsFrontendArticle): EditionsArticle = {
    EditionsArticle(
      article.id.split("/").last,
      article.frontPublicationDate,
      article.meta
    )
  }
}

case class EditionsFrontendCollection(
  id: String,
  displayName: String,
  isHidden: Boolean,
  lastUpdated: Option[Long],
  updatedBy: Option[String],
  updatedEmail: Option[String],
  prefill: Option[CapiPrefillQuery],
  items: List[EditionsFrontendArticle]
)
case class EditionsFrontendCollectionWrapper(id: String, collection: EditionsFrontendCollection)

object EditionsFrontendCollectionWrapper {
  implicit def articleFormat = Json.format[EditionsFrontendArticle]
  implicit def collectionFormat = Json.format[EditionsFrontendCollection]
  implicit def collectionWrapperFormat = Json.format[EditionsFrontendCollectionWrapper]

  def fromCollection(collection: EditionsCollection): EditionsFrontendCollectionWrapper = {
    EditionsFrontendCollectionWrapper(
      collection.id,
      EditionsFrontendCollection(
        collection.id,
        collection.displayName,
        collection.isHidden,
        collection.lastUpdated,
        collection.updatedBy,
        collection.updatedEmail,
        collection.prefill,
        collection.items.map(EditionsFrontendArticle.fromArticle)
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
      frontendCollection.collection.items.map(EditionsFrontendArticle.toArticle)
    )
  }
}
