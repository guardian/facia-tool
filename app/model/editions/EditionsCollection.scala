package model.editions

import java.time.ZonedDateTime
import play.api.libs.json.Json

import scalikejdbc.WrappedResultSet

case class EditionsCollection(
    id: String,
    name: String,
    prefill: String,
    isHidden: Boolean,
    metadata: Option[String],
    updatedOn: Option[ZonedDateTime],
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
      rs.string(prefix + "prefill"),
      rs.boolean(prefix + "is_hidden"),
      rs.stringOpt(prefix + "metadata"),
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
      prefill <- rs.stringOpt(prefix + "prefill")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield
      EditionsCollection(
        id,
        name,
        prefill,
        isHidden,
        rs.stringOpt(prefix + "metadata"),
        rs.zonedDateTimeOpt(prefix + "updated_on"),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        Nil,
        Nil
      )
  }
}
