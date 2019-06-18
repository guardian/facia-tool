package model.editions

import java.time.ZonedDateTime
import play.api.libs.json.Json

import scalikejdbc.WrappedResultSet

case class EditionsFront(
    id: String,
    displayName: String,
    isHidden: Boolean,
    updatedOn: Option[Long],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    collections: List[EditionsCollection]
)

object EditionsFront {
  implicit val writes = Json.writes[EditionsFront]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsFront = {
    EditionsFront(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      Nil
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsFront] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      name <- rs.stringOpt(prefix + "name")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield
      EditionsFront(
        id,
        name,
        isHidden,
        rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        Nil
      )
  }
}
