package model.editions

import java.time.ZonedDateTime
import play.api.libs.json.Json

import scalikejdbc.WrappedResultSet

case class EditionsCollection(
    id: String,
    displayName: String,
    prefill: Option[String],
    isHidden: Boolean,
    lastUpdated: Option[ZonedDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    live: List[EditionsArticle],
    draft: List[EditionsArticle]
)

object EditionsCollection {
  implicit val writes = Json.writes[EditionsCollection]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsCollection = {
    EditionsCollection(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.stringOpt(prefix + "prefill"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on"),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      Nil,
      Nil
    )
  }

  def fromRowOpt(
      rs: WrappedResultSet,
      prefix: String = ""
  ): Option[EditionsCollection] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      name <- rs.stringOpt(prefix + "name")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield
      EditionsCollection(
        id,
        name,
        rs.stringOpt(prefix + "prefill"),
        isHidden,
        rs.zonedDateTimeOpt(prefix + "updated_on"),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        Nil,
        Nil
      )
  }
}
