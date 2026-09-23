package model.packages.client

import model.packages.Package.PackageType
import model.packages.{
  FeastPackageMetadata,
  MetadataHelpers,
  Package,
  PackageMetadata,
  StoryPackageMetadata
}
import org.postgresql.util.PGobject
import play.api.libs.json.{
  JsDefined,
  JsError,
  JsObject,
  JsResult,
  JsString,
  JsSuccess,
  JsUndefined,
  JsValue,
  Json,
  OFormat
}

import java.util.UUID
sealed trait CreatePackageRequest {
  val id: UUID
  val name: String
  val isHidden: Boolean
  val packageType: Package.PackageType.Value
  val createdOn: Long // timestamp in epoch millis
  val createdBy: String
  val createdEmail: String

  def metadataPG: Option[PGobject]
}

case class CreateFeastPackageRequest(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[FeastPackageMetadata],
    createdOn: Long, // timestamp in epoch millis
    createdBy: String,
    createdEmail: String
) extends CreatePackageRequest
    with MetadataHelpers {
  override val packageType: Package.PackageType.Value = PackageType.Feast

  def metadataPG: Option[PGobject] =
    metadata.map(FeastPackageMetadata.format.writes).map(toPGobject)

}

object CreateFeastPackageRequest {
  implicit val format: OFormat[CreateFeastPackageRequest] =
    Json.format[CreateFeastPackageRequest]
}

object CreatePackageRequest {

  implicit val format: OFormat[CreatePackageRequest] =
    new OFormat[CreatePackageRequest] {
      override def writes(o: CreatePackageRequest): JsObject = o match {
        case f: CreateFeastPackageRequest =>
          CreateFeastPackageRequest.format.writes(f)
      }

      override def reads(json: JsValue): JsResult[CreatePackageRequest] =
        ((json \ "packageType") match {
          case JsDefined(JsString("Feast")) =>
            CreateFeastPackageRequest.format.reads(json)
          case JsDefined(value) =>
            JsError(s"$value is not a valid package type")
          case _: JsUndefined =>
            JsError("packageType must be defined")
        })
    }
}
