package model.editions

import play.api.libs.json.Json

// May god have mercy on our souls.
// Ideally the frontend can be changed so we don't have this bonkers modelling!

case class EditionsFrontendArticle(id: String, frontPublicationDate: Long)

object EditionsFrontendArticle {
  def fromArticle(article: EditionsArticle): EditionsFrontendArticle = {
    EditionsFrontendArticle(
      "internal-code/page/" + article.pageCode,
      article.addedOn
    )
  }
}

case class EditionsFrontendCollection(live: List[EditionsFrontendArticle])
case class EditionsFrontendCollectionWrapper(id: String, collection: EditionsFrontendCollection)

object EditionsFrontendCollectionWrapper {
  implicit def articleFormat = Json.format[EditionsFrontendArticle]
  implicit def collectionFormat = Json.format[EditionsFrontendCollection]
  implicit def collectionWrapperFormat = Json.format[EditionsFrontendCollectionWrapper]

  def fromCollection(collection: EditionsCollection): EditionsFrontendCollectionWrapper = {
    EditionsFrontendCollectionWrapper(
      id = collection.id,
      collection = EditionsFrontendCollection(collection.items.map(EditionsFrontendArticle.fromArticle))
    )
  }
}
