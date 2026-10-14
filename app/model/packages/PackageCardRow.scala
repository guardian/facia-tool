package model.packages

import com.typesafe.scalalogging.LazyLogging
import model.editions.{EditionsChefMetadata, EditionsFeastCollectionMetadata}
import org.postgresql.util.PGobject
import play.api.libs.json.{JsValue, Json, OFormat}
import scalikejdbc.WrappedResultSet

import java.time.OffsetDateTime

final case class PackageCardRow(
    packageId: String,
    cardType: PackageCardType,
    pageCode: String, // CAPI internalPageCode of an article. Either the recipe ID, the chef ID or the subcollection ID if this is a Feast card.
    index: Int,
    metadata: Option[JsValue],
    addedOn: OffsetDateTime,
    addedBy: String,
    addedEmail: String
) extends LazyLogging {
  def metadataPG: Option[PGobject] = metadata.map(toPGobject)

  private def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }

  def toPackageCard: Option[PackageCard] = cardType match {
    case PackageCardType.Recipe =>
      Some(PackageRecipeCard(pageCode, addedOn))
    case PackageCardType.Chef =>
      val chefMeta =
        metadata.flatMap(_.validateOpt[EditionsChefMetadata].asOpt.flatten)
      Some(PackageChefCard(pageCode, chefMeta, addedOn))
    case PackageCardType.Subcollection =>
      val collectionMeta = metadata.flatMap(
        _.validateOpt[EditionsFeastCollectionMetadata].asOpt.flatten
      )
      Some(PackageSubcollectionCard(pageCode, collectionMeta, addedOn))
    case PackageCardType.Invalid =>
      logger.warn(
        s"Package $packageId has an invalid card with pageCode $pageCode"
      )
      None
  }
}

object PackageCardRow {
  implicit val format: OFormat[PackageCardRow] = Json.format[PackageCardRow]

  def fromRow(rs: WrappedResultSet): Option[PackageCardRow] =
    for {
      cardType <- PackageCardType.fromString(rs.string("card_type"))
    } yield {
      PackageCardRow(
        packageId = rs.string("package_id"),
        cardType = cardType,
        pageCode = rs.string("page_code"),
        index = rs.int("index"),
        metadata = rs.stringOpt("metadata").map(Json.parse),
        addedOn = rs.offsetDateTime("added_on"),
        addedBy = rs.string("added_by"),
        addedEmail = rs.string("added_email")
      )
    }
}
