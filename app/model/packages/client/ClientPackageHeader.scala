package model.packages.client

import model.packages.{Package, PackageMetadata}
import play.api.libs.json._

case class ClientPackageHeader(
    id: String,
    name: String,
    packageType: Package.PackageType.Value,
    isHidden: Boolean,
    metadata: Option[PackageMetadata],
    createdOn: Option[Long],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String]
)

object ClientPackageHeader {
  implicit val format: OFormat[ClientPackageHeader] =
    Json.format[ClientPackageHeader]

  def fromPackage(domainPackage: Package) = ClientPackageHeader(
    id = domainPackage.id,
    name = domainPackage.name,
    packageType = domainPackage.packageType,
    isHidden = domainPackage.isHidden,
    metadata = domainPackage.metadata,
    createdOn = domainPackage.createdOn.map(_.toInstant.toEpochMilli),
    createdBy = domainPackage.createdBy,
    createdEmail = domainPackage.createdEmail,
    updatedOn = domainPackage.updatedOn.map(_.toInstant.toEpochMilli),
    updatedBy = domainPackage.updatedBy,
    updatedEmail = domainPackage.updatedEmail
  )
}
