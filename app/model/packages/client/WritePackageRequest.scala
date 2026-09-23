package model.packages.client

import model.packages.{
  FeastPackage,
  FeastPackageMetadata,
  MetadataHelpers,
  Package => DomainPackage
}
import model.packages.Package.PackageType
import play.api.libs.json.{JsError, JsValue, Json, OFormat, Reads}

import java.time.OffsetDateTime
import java.util.UUID

sealed trait WritePackageRequest {
  val name: String
  val packageType: PackageType
  val isHidden: Boolean
  val items: List[ClientPackageCard]

  def toPackage(
      packageId: UUID,
      updated: OffsetDateTime,
      updatedBy: String,
      updatedEmail: String
  ): DomainPackage
}

case class WriteFeastPackageRequest(
    name: String,
    isHidden: Boolean,
    metadata: Option[FeastPackageMetadata],
    items: List[ClientPackageCard]
) extends WritePackageRequest {
  override val packageType: PackageType = PackageType.Feast

  override def toPackage(
      packageId: UUID,
      updated: OffsetDateTime,
      updatedBy: String,
      updatedEmail: String
  ): DomainPackage = {
    FeastPackage(
      packageId,
      name,
      isHidden,
      metadata,
      createdOn = None,
      createdBy = None,
      createdEmail = None,
      updatedOn = Some(updated),
      updatedBy = Some(updatedBy),
      updatedEmail = Some(updatedEmail)
    )
  }
}

object WriteFeastPackageRequest {
  implicit val format: OFormat[WriteFeastPackageRequest] =
    Json.format[WriteFeastPackageRequest]
}

object WritePackageRequest extends MetadataHelpers {
  implicit val reads: Reads[WritePackageRequest] = (json: JsValue) =>
    selectByPackageType(json \ "packageType") {
      case PackageType.Feast => WriteFeastPackageRequest.format.reads(json)
      case PackageType.Story =>
        JsError("story package update is not implemented yet")
    }
}
