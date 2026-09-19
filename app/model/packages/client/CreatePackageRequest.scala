package model.packages.client

import model.packages.{MetadataHelpers, Package, PackageMetadata}
import org.postgresql.util.PGobject
import play.api.libs.json.{Json, OFormat}

import java.util.UUID

case class CreatePackageRequest(
    id: UUID,
    name: String,
    isHidden: Boolean,
    packageType: Package.PackageType.Value,
    metadata: Option[PackageMetadata],
    createdOn: Long, // timestamp in epoch millis
    createdBy: String,
    createdEmail: String
) {
  import CreatePackageRequest._
  def metadataPG: Option[PGobject] =
    metadata.map(PackageMetadata.format.writes).map(toPGobject)
}

object CreatePackageRequest extends MetadataHelpers {
  implicit val format: OFormat[CreatePackageRequest] =
    Json.format[CreatePackageRequest]
}
