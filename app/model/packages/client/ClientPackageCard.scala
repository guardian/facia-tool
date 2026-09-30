package model.packages.client

import model.editions.{EditionsChefMetadata, EditionsFeastCollectionMetadata}
import model.packages.{
  PackageCard,
  PackageCardType,
  PackageChefCard,
  PackageRecipeCard,
  PackageSubcollectionCard
}
import play.api.libs.json.{JsValue, Json, OFormat}

import java.time.{Instant, OffsetDateTime, ZoneId}
import java.util.UUID

final case class ClientPackageCard(
    id: String,
    cardType: PackageCardType,
    addedOn: Long,
    metadata: Option[JsValue] = None
)

object ClientPackageCard {
  implicit val format: OFormat[ClientPackageCard] =
    Json.format[ClientPackageCard]

  def fromPackageCard(domainCard: PackageCard): ClientPackageCard =
    ClientPackageCard(
      id = domainCard.pageCode,
      cardType = domainCard.cardType,
      addedOn = domainCard.addedOn.toInstant.toEpochMilli,
      metadata = domainCard.metadataJson
    )

  def toPackageCard(
      client: ClientPackageCard,
      packageId: UUID,
      index: Int,
      userName: String,
      userEmail: String,
      zoneId: Option[ZoneId] = None
  ): PackageCard = {
    val addedOn = OffsetDateTime.ofInstant(
      Instant.ofEpochMilli(client.addedOn),
      zoneId.getOrElse(ZoneId.systemDefault())
    )

    client.cardType match {
      case PackageCardType.Recipe =>
        PackageRecipeCard(
          id = client.id,
          addedOn = addedOn,
          packageId = packageId.toString,
          pageCode = client.id,
          index = index,
          addedBy = userName,
          addedEmail = userEmail
        )
      case PackageCardType.Chef =>
        PackageChefCard(
          id = client.id,
          metadata = client.metadata.flatMap(Json.fromJson[EditionsChefMetadata](_).asOpt),
          addedOn = addedOn,
          packageId = packageId.toString,
          pageCode = client.id,
          index = index,
          addedBy = userName,
          addedEmail = userEmail
        )
      case PackageCardType.Subcollection =>
        PackageSubcollectionCard(
          id = client.id,
          metadata = client.metadata.flatMap(
            Json.fromJson[EditionsFeastCollectionMetadata](_).asOpt
          ),
          addedOn = addedOn,
          packageId = packageId.toString,
          pageCode = client.id,
          index = index,
          addedBy = userName,
          addedEmail = userEmail
        )
      case PackageCardType.Invalid =>
        throw new IllegalArgumentException(
          s"Cannot convert invalid package card type: ${client.cardType}"
        )
    }
  }
}
