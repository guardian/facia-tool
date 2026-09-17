package model.packages.client

import model.packages.{PackageMetadata, Package => DomainPackage}
import play.api.libs.json.{JsValue, Json, OFormat}
import services.editions.db.FaciaDB

final case class ClientPackage(
    id: String,
    name: String,
    isHidden: Boolean,
    packageType: DomainPackage.PackageType.Value,
    metadata: Option[PackageMetadata],
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
      packageType = domainPackage.packageType,
      metadata = domainPackage.metadata,
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
      packageType = clientPackage.packageType,
      isHidden = clientPackage.isHidden,
      metadata = clientPackage.metadata,
      createdOn = clientPackage.createdOn.map(FaciaDB.dateTimeFromMillis),
      createdBy = clientPackage.createdBy,
      createdEmail = clientPackage.createdEmail,
      updatedOn = clientPackage.updatedOn.map(FaciaDB.dateTimeFromMillis),
      updatedBy = clientPackage.updatedBy,
      updatedEmail = clientPackage.updatedEmail
    )
}
