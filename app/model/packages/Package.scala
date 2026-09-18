package model.packages

import logging.Logging
import model.packages.Package.PackageType
import org.postgresql.util.PGobject
import play.api.libs.json.{Format, Json, OFormat}
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
    packageType: PackageType.Value,
    metadata: Option[PackageMetadata],
    createdOn: Option[OffsetDateTime],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[OffsetDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String]
) extends MetadataHelpers {

  def metadataPG: Option[PGobject] = metadata flatMap { meta =>
    Try { Json.toJson(meta) }.toOption.map(toPGobject)
  }
}

object Package extends MetadataHelpers with Logging {
  object PackageType extends Enumeration {
    val Invalid, Web, Feast =
      Value // packages which do not have a valid type string are tagged as Invalid when retrieving to avoid exceptions
  }
  implicit val packageTypeFormat: Format[PackageType.Value] =
    Json.formatEnum(PackageType)
  implicit val format: OFormat[Package] = Json.format[Package]

  private def getMetadata(
      rs: WrappedResultSet,
      id: String,
      packageType: PackageType.Value
  ): Option[PackageMetadata] = packageType match {
    case PackageType.Feast =>
      try {
        rs.stringOpt("metadata")
          .map(Json.parse)
          .map(_.as[FeastPackageMetadata])
      } catch {
        case err: Throwable =>
          logger.error(
            s"Invalid $packageType metadata for package $id: ${err.getMessage}",
            err
          )
          None
      }
    case PackageType.Web =>
      // Not implemented yet
      None
  }

  def fromRow(rs: WrappedResultSet): Package = {
    val packageId = rs.string("id")
    val packageType = PackageType.withName(rs.string("package_type"))
    Package(
      id = packageId,
      name = rs.string("name"),
      isHidden = rs.boolean("is_hidden"),
      packageType = packageType,
      metadata = getMetadata(rs, packageId, packageType),
      createdOn = rs.zonedDateTimeOpt("created_on").map(_.toOffsetDateTime),
      createdBy = rs.stringOpt("created_by"),
      createdEmail = rs.stringOpt("created_email"),
      updatedOn = rs.zonedDateTimeOpt("updated_on").map(_.toOffsetDateTime),
      updatedBy = rs.stringOpt("updated_by"),
      updatedEmail = rs.stringOpt("updated_email")
    )
  }
}
