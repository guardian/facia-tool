package model.packages.client

import model.packages.{PackageCardRow => DomainPackageCard}
import play.api.libs.json.{JsValue, Json, OFormat}

final case class ClientPackageCard(
    id: String,
    packageId: String,
    state: String,
    pageCode: String,
    index: Int,
    metadata: Option[JsValue],
    addedOn: Long,
    addedBy: String,
    addedEmail: String
)

object ClientPackageCard {
  implicit val format: OFormat[ClientPackageCard] =
    Json.format[ClientPackageCard]

  def fromPackageCard(domainCard: DomainPackageCard): ClientPackageCard =
    ClientPackageCard(
      id = domainCard.id,
      packageId = domainCard.packageId,
      state = domainCard.state,
      pageCode = domainCard.pageCode,
      index = domainCard.index,
      metadata = domainCard.metadata,
      addedOn = domainCard.addedOn,
      addedBy = domainCard.addedBy,
      addedEmail = domainCard.addedEmail
    )

  def toPackageCard(clientCard: ClientPackageCard): DomainPackageCard =
    PackageCardRow(
      id = clientCard.id,
      packageId = clientCard.packageId,
      state = clientCard.state,
      pageCode = clientCard.pageCode,
      index = clientCard.index,
      metadata = clientCard.metadata,
      addedOn = clientCard.addedOn,
      addedBy = clientCard.addedBy,
      addedEmail = clientCard.addedEmail
    )
}
