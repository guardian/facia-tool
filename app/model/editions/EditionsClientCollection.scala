package model.editions

import model.editions.client.ClientArticleMetadata
import play.api.libs.json.{Json, OFormat}
import services.editions.prefills.CapiQueryTimeWindow

// Ideally the frontend can be changed so we don't have this weird modelling!

case class EditionsClientCard(id: String, cardType: Option[CardType], frontPublicationDate: Long, meta: Option[ClientArticleMetadata] = None)

object EditionsClientCard {
  implicit val format: OFormat[EditionsClientCard] = Json.format[EditionsClientCard]

  def fromCard(card: EditionsCard): EditionsClientCard = card match {
    case EditionsArticle(id, addedOn, metadata) => 
      EditionsClientCard(
        id,
        Some(card.cardType),
        card.addedOn,
        card.metadata.map(ClientArticleMetadata.fromCardMetadata)
      )
    case EditionsRecipe(id, addedOn) => 
      EditionsClientCard(
        id,
        Some(CardType.Recipe),
        card.addedOn
      )
    case EditionsChef(id, addedOn, metadata) => 
      EditionsClientCard(
        id,
        Some(CardType.Recipe),
        card.addedOn
      )
    case EditionsFeastCollection(id, addedOn) => 
  }
    val id = card.cardType match {
      case CardType.Article => "internal-code/page/" + card.id
      case _ => card.id
    }

    EditionsClientCard(
      id,
      Some(card.cardType),
      card.addedOn,
      card.metadata.map(ClientArticleMetadata.fromCardMetadata)
    )
  }
  def toCard(card: EditionsClientCard): EditionsCard = {
    val id = card.cardType match {
      case Some(CardType.Article) | None => card.id.split("/").last
      case _ => card.id
    }

    EditionsCard(
      id,
      card.cardType.getOrElse(CardType.Article),
      card.frontPublicationDate,
      card.meta.map(_.toCardMetadata)
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
  contentPrefillTimeWindow: Option[CapiQueryTimeWindow],
  items: List[EditionsClientCard]
)
case class EditionsFrontendCollectionWrapper(id: String, collection: EditionsClientCollection)

object EditionsFrontendCollectionWrapper {
  implicit def cardFormat: OFormat[EditionsClientCard] = Json.format[EditionsClientCard]
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
        collection.contentPrefillTimeWindow,
        collection.items.map(EditionsClientCard.fromCard)
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
      frontendCollection.collection.contentPrefillTimeWindow,
      frontendCollection.collection.items.map(EditionsClientCard.toCard)
    )
  }
}
