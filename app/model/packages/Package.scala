package model.packages

import logging.Logging
import model.packages.Package.PackageType
import org.postgresql.util.PGobject
import play.api.libs.json.{
  Format,
  JsDefined,
  JsError,
  JsObject,
  JsResult,
  JsString,
  JsSuccess,
  JsValue,
  Json,
  OFormat,
  OWrites,
  Reads
}
import scalikejdbc.WrappedResultSet

import java.time.OffsetDateTime
import java.util.UUID
import scala.util.{Failure, Success, Try}

sealed trait Package {
  val id: UUID
  val name: String
  val isHidden: Boolean
  val packageType: PackageType
  val createdOn: Option[OffsetDateTime]
  val createdBy: Option[String]
  val createdEmail: Option[String]
  val updatedOn: Option[OffsetDateTime]
  val updatedBy: Option[String]
  val updatedEmail: Option[String]

  def metadataPG: Option[PGobject]
}

/** A Package is a lot like a collection, in that it represents an ordered set
  * of Cards. The difference to a Collection is that a Collection must belong to
  * a Front; a Package is a top-level object that exists independently of any
  * Front, Issue or Edition
  */
final case class FeastPackage(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[FeastPackageMetadata],
    createdOn: Option[OffsetDateTime],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[OffsetDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String]
) extends Package
    with MetadataHelpers {

  override val packageType: Package.PackageType = PackageType.Feast
  override def metadataPG: Option[PGobject] =
    metadata.map(FeastPackageMetadata.format.writes).map(toPGobject)
}

final case class StoryPackage(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[StoryPackageMetadata],
    createdOn: Option[OffsetDateTime],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[OffsetDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String]
) extends Package
    with MetadataHelpers {

  override val packageType: Package.PackageType = PackageType.Story
  override def metadataPG: Option[PGobject] =
    metadata.map(StoryPackageMetadata.format.writes).map(toPGobject)
}

object Package extends MetadataHelpers with Logging {
  sealed trait PackageType {
    val value: String
  }
  object PackageType {
    case object Feast extends PackageType {
      val value = "Feast"
      override def toString = value
    }
    case object Story extends PackageType {
      val value = "Story"
      override def toString = value
    }

    def withName(str: String): Option[PackageType] = str match {
      case "Feast" => Some(Feast)
      case "Story" => Some(Story)
      case _       => None
    }
  }

  implicit val storyPackageWrites: OWrites[StoryPackage] =
    Json
      .format[StoryPackage]
      .transform((obj: JsObject) => {
        obj ++ JsObject(
          Seq("packageType" -> JsString(PackageType.Story.value))
        )
      })
  implicit val storyPackageReads: Reads[StoryPackage] = Json.reads[StoryPackage]

  implicit val feastPackageWrites: OWrites[FeastPackage] =
    Json
      .format[FeastPackage]
      .transform((obj: JsObject) => {
        obj ++ JsObject(
          Seq("packageType" -> JsString(PackageType.Feast.value))
        )
      })
  implicit val feastPackageReads: Reads[FeastPackage] = Json.reads[FeastPackage]

  implicit val packageTypeFormat: Format[PackageType] =
    new Format[PackageType] {
      override def writes(o: PackageType): JsValue = JsString(o.value)

      override def reads(json: JsValue): JsResult[PackageType] =
        json
          .validate[String]
          .flatMap(str =>
            PackageType.withName(str) match {
              case Some(value) => JsSuccess(value)
              case None => JsError(s"$str is not a recognised package type")
            }
          )
    }
  implicit val format: OFormat[Package] = new OFormat[Package] {
    override def writes(o: Package): JsObject = o match {
      case st: StoryPackage => storyPackageWrites.writes(st)
      case f: FeastPackage  => feastPackageWrites.writes(f)
    }

    override def reads(json: JsValue): JsResult[Package] =
      selectByPackageType(json \ "packageType") {
        case PackageType.Story => storyPackageReads.reads(json)
        case PackageType.Feast => feastPackageReads.reads(json)
      }
  }

  def fromRow(rs: WrappedResultSet): Option[Package] = {
    val maybePackageId = Try { UUID.fromString(rs.string("id")) }
    val maybePackageType = PackageType.withName(rs.string("package_type"))

    (maybePackageType, maybePackageId) match {
      case (Some(PackageType.Feast), Success(packageId)) =>
        Some(
          FeastPackage(
            id = packageId,
            name = rs.string("name"),
            isHidden = rs.boolean("is_hidden"),
            metadata = (FeastPackageMetadata.fromJson(
              rs.stringOpt("metadata")
            ) match {
              case None                      => None // No input
              case Some(JsSuccess(value, _)) => Some(value)
              case Some(JsError(errors)) =>
                logger.error(
                  s"Unable to deserialise Feast package metadata for $packageId: ${errors.mkString(";")}"
                )
                None
            }),
            createdOn =
              rs.zonedDateTimeOpt("created_on").map(_.toOffsetDateTime),
            createdBy = rs.stringOpt("created_by"),
            createdEmail = rs.stringOpt("created_email"),
            updatedOn =
              rs.zonedDateTimeOpt("updated_on").map(_.toOffsetDateTime),
            updatedBy = rs.stringOpt("updated_by"),
            updatedEmail = rs.stringOpt("updated_email")
          )
        )
      case (Some(PackageType.Story), Success(packageId)) =>
        Some(
          StoryPackage(
            id = packageId,
            name = rs.string("name"),
            isHidden = rs.boolean("is_hidden"),
            metadata = (StoryPackageMetadata.fromJson(
              rs.stringOpt("metadata")
            ) match {
              case None                      => None // No input
              case Some(JsSuccess(value, _)) => Some(value)
              case Some(JsError(errors)) =>
                logger.error(
                  s"Unable to deserialise Feast package metadata for $packageId: ${errors.mkString(";")}"
                )
                None
            }),
            createdOn =
              rs.zonedDateTimeOpt("created_on").map(_.toOffsetDateTime),
            createdBy = rs.stringOpt("created_by"),
            createdEmail = rs.stringOpt("created_email"),
            updatedOn =
              rs.zonedDateTimeOpt("updated_on").map(_.toOffsetDateTime),
            updatedBy = rs.stringOpt("updated_by"),
            updatedEmail = rs.stringOpt("updated_email")
          )
        )
      case (_, Failure(_)) =>
        logger.error(
          s"Package with ID ${rs.string("id")} is not valid, the ID did not parse as a UUID"
        )
        None
      case (None, packageId) =>
        logger.error(
          s"Package with ID $packageId is not valid,no package type provided"
        )
        None
    }
  }
}
