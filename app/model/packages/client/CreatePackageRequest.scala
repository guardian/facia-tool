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
  val packageType: Package.PackageType

  def metadataPG: Option[PGobject]
}

case class CreateFeastPackageRequest(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[FeastPackageMetadata]
) extends CreatePackageRequest
    with MetadataHelpers {
  override val packageType: Package.PackageType = PackageType.Feast

  def metadataPG: Option[PGobject] =
    metadata.map(FeastPackageMetadata.format.writes).map(toPGobject)
}

object CreateFeastPackageRequest {
  implicit val format: OFormat[CreateFeastPackageRequest] =
    Json.format[CreateFeastPackageRequest]
}

case class CreateStoryPackageRequest(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[StoryPackageMetadata]
) extends CreatePackageRequest
    with MetadataHelpers {
  override val packageType: Package.PackageType = PackageType.Story

  def metadataPG: Option[PGobject] =
    metadata.map(Json.toJson[StoryPackageMetadata]).map(toPGobject)
}

object CreateStoryPackageRequest {
  implicit val format: OFormat[CreateStoryPackageRequest] =
    Json.format[CreateStoryPackageRequest]
}
object CreatePackageRequest extends MetadataHelpers {

  implicit val format: OFormat[CreatePackageRequest] =
    new OFormat[CreatePackageRequest] {
      override def writes(o: CreatePackageRequest): JsObject = o match {
        case f: CreateFeastPackageRequest =>
          CreateFeastPackageRequest.format.writes(f)
        case s: CreateStoryPackageRequest =>
          CreateStoryPackageRequest.format.writes(s)
      }

      override def reads(json: JsValue): JsResult[CreatePackageRequest] =
        selectByPackageType(json \ "packageType") {
          case PackageType.Feast => json.validate[CreateFeastPackageRequest]
          case PackageType.Story => json.validate[CreateStoryPackageRequest]
        }
    }
}
