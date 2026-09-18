package model.packages.client

import model.packages.{PackageCardRow, PackageCardType}
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

  def fromPackageCard(domainCard: PackageCardRow): ClientPackageCard =
    ClientPackageCard(
      id = domainCard.pageCode,
      cardType = domainCard.cardType,
      addedOn = domainCard.addedOn.toInstant.toEpochMilli,
      metadata = domainCard.metadata
    )

  def toPackageCard(
      client: ClientPackageCard,
      packageId: UUID,
      index: Int,
      userName: String,
      userEmail: String,
      zoneId: Option[ZoneId] = None
  ) = {
    val addedOn = Instant.ofEpochMilli(client.addedOn)
    PackageCardRow(
      packageId = packageId.toString,
      cardType = client.cardType,
      pageCode = client.id,
      index = index,
      metadata = client.metadata,
      addedOn = OffsetDateTime
        .ofInstant(addedOn, zoneId.getOrElse(ZoneId.systemDefault())),
      addedBy = userName,
      addedEmail = userEmail
    )
  }
}
