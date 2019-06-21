package model.editions

import play.api.libs.json.Json

// Ideally the frontend can be changed so we don't have this weird modelling!

case class EditionsFrontendArticle(id: String, frontPublicationDate: Long)

object EditionsFrontendArticle {
  def fromArticle(article: EditionsArticle): EditionsFrontendArticle = {
    EditionsFrontendArticle(
      "internal-code/page/" + article.pageCode,
      article.addedOn
    )
  }
}

case class EditionsFrontendCollection(items: List[EditionsFrontendArticle])
case class EditionsFrontendCollectionWrapper(id: String, collection: EditionsFrontendCollection)

object EditionsFrontendCollectionWrapper {
  implicit def articleFormat = Json.format[EditionsFrontendArticle]
  implicit def collectionFormat = Json.format[EditionsFrontendCollection]
  implicit def collectionWrapperFormat = Json.format[EditionsFrontendCollectionWrapper]

  def fromCollection(collection: EditionsCollection): EditionsFrontendCollectionWrapper = {
    EditionsFrontendCollectionWrapper(
      collection.id,
      EditionsFrontendCollection(collection.items.map(EditionsFrontendArticle.fromArticle))
    )
  }
}
