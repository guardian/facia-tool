package model.packages

import logging.Logging
import model.packages.FeastPackageMetadata
import org.postgresql.util.PGobject
import play.api.libs.json.{JsResult, JsValue, Json, OFormat}
import scalikejdbc.WrappedResultSet

import java.time.OffsetDateTime
import scala.util.Try

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
    feastMetadata: Option[FeastPackageMetadata],
    prefill: Option[String],
    createdOn: Option[OffsetDateTime],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[OffsetDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String]
) {
  import Package.toPGobject
  def webMetadataPG: Option[PGobject] = webMetadata.map(toPGobject)

  def feastMetadataPG: Option[PGobject] = Package.feastMetadataPG(feastMetadata)
}

object Package extends MetadataHelpers with Logging {
  implicit val format: OFormat[Package] = Json.format[Package]

  def fromRow(rs: WrappedResultSet): Package =
    Package(
      id = rs.string("id"),
      name = rs.string("name"),
      isHidden = rs.boolean("is_hidden"),
      webMetadata = rs.stringOpt("web_metadata").map(Json.parse),
      feastMetadata =
        rs.stringOpt("feast_metadata").flatMap(getFeastCollectionMetadata),
      prefill = rs.stringOpt("prefill"),
      createdOn = rs.zonedDateTimeOpt("created_on").map(_.toOffsetDateTime),
      createdBy = rs.stringOpt("created_by"),
      createdEmail = rs.stringOpt("created_email"),
      updatedOn = rs.zonedDateTimeOpt("updated_on").map(_.toOffsetDateTime),
      updatedBy = rs.stringOpt("updated_by"),
      updatedEmail = rs.stringOpt("updated_email")
    )
}
