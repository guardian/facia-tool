package model.packages.client

import model.packages.{MetadataHelpers, PackageMetadata, Package}
import org.postgresql.util.PGobject
import play.api.libs.json.{Json, OFormat}

case class CreatePackageRequest(
    id: String,
    name: String,
    isHidden: Boolean,
    packageType: Package.PackageType.Value,
    metadata: Option[PackageMetadata],
    createdOn: Long,
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
