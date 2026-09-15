package model.packages

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
) {
  def metadataPG: Option[PGobject] = metadata.map(toPGobject)

  private def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }
}

object PackageCardRow {
  implicit val format: OFormat[PackageCardRow] = Json.format[PackageCardRow]

  def fromRow(rs: WrappedResultSet): PackageCardRow =
    PackageCardRow(
      packageId = rs.string("package_id"),
      cardType = PackageCardType
        .fromString(rs.string("card_type"))
        .getOrElse(
          throw new IllegalArgumentException(
            s"Invalid card type: ${rs.string("card_type")}"
          )
        ),
      pageCode = rs.string("page_code"),
      index = rs.int("index"),
      metadata = rs.stringOpt("metadata").map(Json.parse),
      addedOn = rs.zonedDateTime("added_on").toOffsetDateTime,
      addedBy = rs.string("added_by"),
      addedEmail = rs.string("added_email")
    )
}
