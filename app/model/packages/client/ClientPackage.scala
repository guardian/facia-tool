package model.packages.client

import model.packages.Package.PackageType
import model.packages.{
  FeastPackage,
  FeastPackageMetadata,
  StoryPackage,
  StoryPackageMetadata,
  Package => DomainPackage
}
import play.api.libs.json.{
  JsObject,
  JsString,
  JsValue,
  Json,
  OFormat,
  OWrites,
  Reads
}
import services.editions.db.FaciaDB

import java.util.UUID

sealed trait ClientPackage {
  val id: UUID
  val name: String
  val packageType: DomainPackage.PackageType
  val isHidden: Boolean
  val createdOn: Option[Long]
  val createdBy: Option[String]
  val createdEmail: Option[String]
  val updatedOn: Option[Long]
  val updatedBy: Option[String]
  val updatedEmail: Option[String]
  val items: List[ClientPackageCard]
  def withId(newId: UUID): ClientPackage
}

final case class FeastClientPackage(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[FeastPackageMetadata],
    createdOn: Option[Long],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    items: List[ClientPackageCard] = List.empty
) extends ClientPackage {
  override val packageType = PackageType.Feast

  override def withId(newId: UUID): ClientPackage = copy(id = newId)
}

object FeastClientPackage {
  implicit val writes: OWrites[FeastClientPackage] =
    Json
      .format[FeastClientPackage]
      .transform((obj: JsObject) => {
        obj ++ JsObject(
          Seq("packageType" -> JsString(PackageType.Feast.toString))
        )
      })

  implicit val reads: Reads[FeastClientPackage] = Json.reads[FeastClientPackage]
}

final case class StoryClientPackage(
    id: UUID,
    name: String,
    isHidden: Boolean,
    metadata: Option[StoryPackageMetadata],
    createdOn: Option[Long],
    createdBy: Option[String],
    createdEmail: Option[String],
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    items: List[ClientPackageCard] = List.empty
) extends ClientPackage {
  override val packageType = PackageType.Story

  override def withId(newId: UUID): ClientPackage = copy(id = newId)
}

object StoryClientPackage {
  implicit val writes: OWrites[StoryClientPackage] =
    Json
      .format[StoryClientPackage]
      .transform((obj: JsObject) => {
        obj ++ JsObject(
          Seq("packageType" -> JsString(PackageType.Story.toString))
        )
      })

  implicit val reads: Reads[StoryClientPackage] = Json.reads[StoryClientPackage]
}

object ClientPackage {
  implicit val writes: OWrites[ClientPackage] =
    Json
      .format[ClientPackage]
      .transform((obj: JsObject) =>
        JsObject(
          obj.fields.filterNot(_._1 == "_type")
        )
      )
  implicit val reads: Reads[ClientPackage] = Json.reads[ClientPackage]

  def fromPackage(
      domainPackage: DomainPackage,
      cards: List[ClientPackageCard] = List.empty
  ): ClientPackage = domainPackage match {
    case f: FeastPackage =>
      FeastClientPackage(
        id = domainPackage.id,
        name = domainPackage.name,
        isHidden = domainPackage.isHidden,
        metadata = f.metadata,
        createdOn = domainPackage.createdOn.map(_.toInstant.toEpochMilli),
        createdBy = domainPackage.createdBy,
        createdEmail = domainPackage.createdEmail,
        updatedOn = domainPackage.updatedOn.map(_.toInstant.toEpochMilli),
        updatedBy = domainPackage.updatedBy,
        updatedEmail = domainPackage.updatedEmail,
        items = cards
      )
    case s: StoryPackage =>
      StoryClientPackage(
        id = domainPackage.id,
        name = domainPackage.name,
        isHidden = domainPackage.isHidden,
        metadata = s.metadata,
        createdOn = domainPackage.createdOn.map(_.toInstant.toEpochMilli),
        createdBy = domainPackage.createdBy,
        createdEmail = domainPackage.createdEmail,
        updatedOn = domainPackage.updatedOn.map(_.toInstant.toEpochMilli),
        updatedBy = domainPackage.updatedBy,
        updatedEmail = domainPackage.updatedEmail,
        items = cards
      )
  }

  def toPackage(clientPackage: ClientPackage): DomainPackage =
    clientPackage match {
      case f: FeastClientPackage =>
        FeastPackage(
          id = f.id,
          name = f.name,
          isHidden = f.isHidden,
          metadata = f.metadata,
          createdOn = f.createdOn.map(FaciaDB.dateTimeFromMillis),
          createdBy = f.createdBy,
          createdEmail = f.createdEmail,
          updatedOn = f.updatedOn.map(FaciaDB.dateTimeFromMillis),
          updatedBy = f.updatedBy,
          updatedEmail = f.updatedEmail
        )
      case s: StoryClientPackage =>
        StoryPackage(
          id = s.id,
          name = s.name,
          isHidden = s.isHidden,
          metadata = s.metadata,
          createdOn = s.createdOn.map(FaciaDB.dateTimeFromMillis),
          createdBy = s.createdBy,
          createdEmail = s.createdEmail,
          updatedOn = s.updatedOn.map(FaciaDB.dateTimeFromMillis),
          updatedBy = s.updatedBy,
          updatedEmail = s.updatedEmail
        )
    }
}
