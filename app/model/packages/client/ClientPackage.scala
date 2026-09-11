package model.packages.client

import model.packages.FeastPackageMetadata
import model.packages.{Package => DomainPackage}
import play.api.libs.json.{JsValue, Json, OFormat}
import services.editions.db.FaciaDB

final case class ClientPackage(
    id: String,
    name: String,
    isHidden: Boolean,
    webMetadata: Option[JsValue],
    feastMetadata: Option[FeastPackageMetadata],
    prefill: Option[String],
    createdOn: Option[Long],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    items: List[ClientPackageCard] = List.empty
)

object ClientPackage {
  implicit val format: OFormat[ClientPackage] = Json.format[ClientPackage]

  def fromPackage(
      domainPackage: DomainPackage,
      cards: List[ClientPackageCard] = List.empty
  ): ClientPackage =
    ClientPackage(
      id = domainPackage.id,
      name = domainPackage.name,
      isHidden = domainPackage.isHidden,
      webMetadata = domainPackage.webMetadata,
      feastMetadata = domainPackage.feastMetadata,
      prefill = domainPackage.prefill,
      createdOn = domainPackage.createdOn.map(_.toInstant.toEpochMilli),
      createdBy = domainPackage.createdBy,
      createdEmail = domainPackage.createdEmail,
      updatedOn = domainPackage.updatedOn.map(_.toInstant.toEpochMilli),
      updatedBy = domainPackage.updatedBy,
      updatedEmail = domainPackage.updatedEmail,
      items = cards
    )

  def toPackage(clientPackage: ClientPackage): DomainPackage =
    DomainPackage(
      id = clientPackage.id,
      name = clientPackage.name,
      isHidden = clientPackage.isHidden,
      webMetadata = clientPackage.webMetadata,
      feastMetadata = clientPackage.feastMetadata,
      prefill = clientPackage.prefill,
      createdOn = clientPackage.createdOn.map(FaciaDB.dateTimeFromMillis),
      createdBy = clientPackage.createdBy,
      createdEmail = clientPackage.createdEmail,
      updatedOn = clientPackage.updatedOn.map(FaciaDB.dateTimeFromMillis),
      updatedBy = clientPackage.updatedBy,
      updatedEmail = clientPackage.updatedEmail
    )
}
