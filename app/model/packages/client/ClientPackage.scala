package model.packages.client

import model.packages.{Package => DomainPackage}
import play.api.libs.json.{JsValue, Json, OFormat}

final case class ClientPackage(
    id: String,
    name: String,
    isHidden: Boolean,
    webMetadata: Option[JsValue],
    feastMetadata: Option[JsValue],
    prefill: Option[String],
    createdOn: Option[Long],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String]
)

object ClientPackage {
  implicit val format: OFormat[ClientPackage] = Json.format[ClientPackage]

  def fromPackage(domainPackage: DomainPackage): ClientPackage =
    ClientPackage(
      id = domainPackage.id,
      name = domainPackage.name,
      isHidden = domainPackage.isHidden,
      webMetadata = domainPackage.webMetadata,
      feastMetadata = domainPackage.feastMetadata,
      prefill = domainPackage.prefill,
      createdOn = domainPackage.createdOn,
      createdBy = domainPackage.createdBy,
      createdEmail = domainPackage.createdEmail,
      updatedOn = domainPackage.updatedOn,
      updatedBy = domainPackage.updatedBy,
      updatedEmail = domainPackage.updatedEmail
    )

  def toPackage(clientPackage: ClientPackage): DomainPackage =
    DomainPackage(
      id = clientPackage.id,
      name = clientPackage.name,
      isHidden = clientPackage.isHidden,
      webMetadata = clientPackage.webMetadata,
      feastMetadata = clientPackage.feastMetadata,
      prefill = clientPackage.prefill,
      createdOn = clientPackage.createdOn,
      createdBy = clientPackage.createdBy,
      createdEmail = clientPackage.createdEmail,
      updatedOn = clientPackage.updatedOn,
      updatedBy = clientPackage.updatedBy,
      updatedEmail = clientPackage.updatedEmail
    )
}
