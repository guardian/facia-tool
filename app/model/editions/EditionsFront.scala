package model.editions

import org.postgresql.util.PGobject
import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

object EditionsFrontMetadata {
  implicit val format = Json.format[EditionsFrontMetadata]
}

case class EditionsFrontMetadata(nameOverride: Option[String], swatch: Option[Swatch]) {
  def toPGobject: PGobject = {
    val pgo = new PGobject()
    pgo.setType("json")
    pgo.setValue(Json.toJson(this).toString())
    pgo
  }
}

case class EditionsFront(
    id: String,
    displayName: String,
    index: Int,
    canRename: Boolean,
    isHidden: Boolean,
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    metadata: Option[EditionsFrontMetadata],
    collections: List[EditionsCollection]
) {
  def toPublishedFront: Option[PublishedFront] = {
    if (isHidden)
      None
    else
      Some(PublishedFront(
        id,
        displayName,
        collections.map(_.toPublishedCollection)
      ))
  }
}

object EditionsFront {
  implicit val writes = Json.writes[EditionsFront]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsFront = {
    EditionsFront(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.int(prefix + "index"),
      rs.boolean(prefix + "can_rename"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[EditionsFrontMetadata].get),
      Nil
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsFront] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      name <- rs.stringOpt(prefix + "name")
      index <- rs.intOpt(prefix + "index")
      canRename <- rs.booleanOpt(prefix + "can_rename")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield
      EditionsFront(
        id,
        name,
        index,
        canRename,
        isHidden,
        rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[EditionsFrontMetadata].get),
        Nil
      )
  }
}
