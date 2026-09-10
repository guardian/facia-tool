package model.packages.client

import org.postgresql.util.PGobject
import play.api.libs.json.JsValue
import play.api.libs.json.{Json, OFormat}

case class CreatePackageRequest(
    id: String,
    name: String,
    isHidden: Boolean,
    webMetadata: Option[JsValue],
    feastMetadata: Option[JsValue],
    prefill: Option[String],
    createdOn: Long,
    createdBy: String,
    createdEmail: String
) {
  def webMetadataPG: Option[PGobject] = webMetadata.map(toPGobject)

  def feastMetadataPG: Option[PGobject] = feastMetadata.map(toPGobject)

  private def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }
}

object CreatePackageRequest {
  implicit val format: OFormat[CreatePackageRequest] =
    Json.format[CreatePackageRequest]
}
