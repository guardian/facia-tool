package model.packages

import org.postgresql.util.PGobject
import play.api.libs.json.{JsValue, Json, OFormat}
import scalikejdbc.WrappedResultSet

final case class PackageCard(
		id: String,
		packageId: String,
		state: String,
		pageCode: String, //CAPI internalPageCode of an article. Either the recipe ID, the chef ID or the subcollection ID if this is a Feast card.  
		index: Int,
		metadata: Option[JsValue],
		addedOn: Long,
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

object PackageCard {
	implicit val format: OFormat[PackageCard] = Json.format[PackageCard]

	def fromRow(rs: WrappedResultSet): PackageCard =
		PackageCard(
			id = rs.string("id"),
			packageId = rs.string("package_id"),
			state = rs.string("state"),
			pageCode = rs.string("page_code"),
			index = rs.int("index"),
			metadata = rs.stringOpt("metadata").map(Json.parse),
			addedOn = rs.zonedDateTime("added_on").toInstant.toEpochMilli,
			addedBy = rs.string("added_by"),
			addedEmail = rs.string("added_email")
		)
}
