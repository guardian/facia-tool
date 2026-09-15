package model.packages.client

import model.packages.FeastPackageMetadata
import model.packages.MetadataHelpers
import org.postgresql.util.PGobject
import play.api.libs.json.JsValue
import play.api.libs.json.{Json, OFormat}

case class CreatePackageRequest(
    id: String,
    name: String,
    isHidden: Boolean,
    webMetadata: Option[JsValue],
    feastMetadata: Option[FeastPackageMetadata],
    prefill: Option[String],
    createdOn: Long,
    createdBy: String,
    createdEmail: String
) {
  import CreatePackageRequest._
  def webMetadataPG: Option[PGobject] = webMetadata.map(toPGobject)

  def feastMetadataPG: Option[PGobject] =
    CreatePackageRequest.feastMetadataPG(feastMetadata)

}

object CreatePackageRequest extends MetadataHelpers {
  implicit val format: OFormat[CreatePackageRequest] =
    Json.format[CreatePackageRequest]
}
