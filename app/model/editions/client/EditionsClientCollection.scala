package model.editions.client

import play.api.libs.json.{Json, OFormat}
import services.editions.prefills.CapiQueryTimeWindow
import model.editions.EditionsCard
import model.editions.EditionsArticle
import model.editions.{
  CapiPrefillQuery,
  EditionsCollection,
  EditionsRecipe,
  EditionsChef,
  EditionsFeastCollection,
  CardType
}
import model.editions.EditionsFeastCollectionItem

// Ideally the frontend can be changed so we don't have this weird modelling!
case class EditionsClientCard(
    id: String,
    cardType: Option[CardType],
    frontPublicationDate: Long,
    meta: Option[ClientCardMetadata] = None
)

object EditionsClientCard {
  implicit val format: OFormat[EditionsClientCard] =
    Json.format[EditionsClientCard]

  def fromCard(card: EditionsCard): EditionsClientCard = card match {
    case EditionsArticle(id, addedOn, metadata) =>
      EditionsClientCard(
        id = "internal-code/page/" + id,
        Some(CardType.Article),
        addedOn,
        metadata.map(ClientCardMetadata.fromCardMetadata)
      )
    case EditionsRecipe(id, addedOn) =>
      EditionsClientCard(
        id,
        Some(CardType.Recipe),
        addedOn
      )
    case EditionsChef(id, addedOn, metadata) =>
      EditionsClientCard(
        id,
        Some(CardType.Chef),
        addedOn,
        metadata.map(ClientCardMetadata.fromCardMetadata)
      )
    case EditionsFeastCollection(id, addedOn, metadata) =>
      EditionsClientCard(
        id,
        Some(CardType.FeastCollection),
        addedOn,
        metadata.map(ClientCardMetadata.fromCardMetadata)
      )
  }

  def toCard(card: EditionsClientCard): EditionsCard = card.cardType match {
    case Some(CardType.Article) | None =>
      val id = card.id.split("/").last
      EditionsArticle(
        id,
        card.frontPublicationDate,
        card.meta.map(_.toArticleMetadata)
      )
    case Some(CardType.Recipe) =>
      EditionsRecipe(
        card.id,
        card.frontPublicationDate
      )
    case Some(CardType.Chef) =>
      EditionsChef(
        card.id,
        card.frontPublicationDate,
        card.meta.map(_.toChefMetadata)
      )
    case Some(CardType.FeastCollection) =>
      EditionsFeastCollection(
        card.id,
        card.frontPublicationDate,
        card.meta.map(_.toFeastCollectionMetadata)
      )
  }
}

case class EditionsSupportingClientCard(
    id: String,
    cardType: Option[CardType],
    frontPublicationDate: Long,
    meta: Option[ClientCardMetadata] = None
)

object EditionsSupportingClientCard {
  implicit def format: OFormat[EditionsSupportingClientCard] =
    Json.format[EditionsSupportingClientCard]

  def fromFeastCollectionItem(item: EditionsFeastCollectionItem) = item match {
    case EditionsRecipe(id, addedOn) =>
      EditionsSupportingClientCard(id, Some(CardType.Recipe), addedOn)
    case EditionsChef(id, addedOn, metadata) =>
      EditionsSupportingClientCard(
        id,
        Some(CardType.Chef),
        addedOn,
        metadata.map(ClientCardMetadata.fromCardMetadata)
      )
  }

  def toFeastCollectionItem(supportingCard: EditionsSupportingClientCard) =
    supportingCard.cardType match {
      case Some(CardType.Recipe) =>
        EditionsRecipe(supportingCard.id, supportingCard.frontPublicationDate)
      case Some(CardType.Chef) =>
        EditionsChef(
          supportingCard.id,
          supportingCard.frontPublicationDate,
          supportingCard.meta.map(_.toChefMetadata)
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

object EditionsClientCollection {
  implicit val collectionFormat: OFormat[EditionsClientCollection] =
    Json.format[EditionsClientCollection]
}

case class EditionsFrontendCollectionWrapper(
    id: String,
    collection: EditionsClientCollection
)

object EditionsFrontendCollectionWrapper {
  implicit def collectionWrapperFormat
      : OFormat[EditionsFrontendCollectionWrapper] =
    Json.format[EditionsFrontendCollectionWrapper]

  def fromCollection(
      collection: EditionsCollection
  ): EditionsFrontendCollectionWrapper = {
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

  def toCollection(
      frontendCollection: EditionsFrontendCollectionWrapper
  ): EditionsCollection = {
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
