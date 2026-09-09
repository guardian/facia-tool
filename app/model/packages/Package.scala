package model.packages

import org.postgresql.util.PGobject
import play.api.libs.json.{JsValue, Json, OFormat}
import scalikejdbc.WrappedResultSet

/** A Package is a lot like a collection, in that it represents an ordered set
  * of Cards. The difference to a Collection is that a Collection must belong to
  * a Front; a Package is a top-level object that exists independently of any
  * Front, Issue or Edition
  */
final case class Package(
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

object Package {
  implicit val format: OFormat[Package] = Json.format[Package]

  def fromRow(rs: WrappedResultSet): Package =
    Package(
      id = rs.string("id"),
      name = rs.string("name"),
      isHidden = rs.boolean("is_hidden"),
      webMetadata = rs.stringOpt("web_metadata").map(Json.parse),
      feastMetadata = rs.stringOpt("feast_metadata").map(Json.parse),
      prefill = rs.stringOpt("prefill"),
      createdOn = rs
        .zonedDateTimeOpt("created_on")
        .map(_.toInstant.toEpochMilli),
      createdBy = rs.stringOpt("created_by"),
      createdEmail = rs.stringOpt("created_email"),
      updatedOn = rs
        .zonedDateTimeOpt("updated_on")
        .map(_.toInstant.toEpochMilli),
      updatedBy = rs.stringOpt("updated_by"),
      updatedEmail = rs.stringOpt("updated_email")
    )
}
