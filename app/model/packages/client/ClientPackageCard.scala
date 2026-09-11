package model.packages.client

import model.packages.{PackageCardRow, PackageCardType}
import play.api.libs.json.{JsValue, Json, OFormat}

final case class ClientPackageCard(
    id: String,
    cardType: Option[PackageCardType],
    addedOn: Long,
    metadata: Option[JsValue] = None
)

object ClientPackageCard {
  implicit val format: OFormat[ClientPackageCard] =
    Json.format[ClientPackageCard]

  def fromPackageCard(domainCard: PackageCardRow): ClientPackageCard =
    ClientPackageCard(
      id = domainCard.pageCode,
      cardType = Some(domainCard.cardType),
      addedOn = domainCard.addedOn.toInstant.toEpochMilli,
      metadata = domainCard.metadata
    )

//  def toPackageCard(client: ClientPackageCard, packageId: String, ) = PackageCardRow(
//	id =
//  )
}
