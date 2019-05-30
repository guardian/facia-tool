package model.editions

import java.time.ZonedDateTime
import play.api.libs.json.Json

import scalikejdbc.WrappedResultSet

case class EditionsCollection(
    id: String,
    name: String,
    prefill: String,
    metadata: Option[String],
    updatedOn: Option[ZonedDateTime],
    updatedBy: Option[String],
    updatedEmail: Option[String],
    articles: List[EditionsArticle]
)

object EditionsCollection {
  implicit val writes = Json.writes[EditionsCollection]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsCollection = {
    EditionsCollection(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.string(prefix + "prefill"),
      rs.stringOpt(prefix + "metadata"),
      rs.zonedDateTimeOpt(prefix + "updated_on"),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
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
    } yield
      EditionsCollection(
        id,
        name,
        prefill,
        rs.stringOpt(prefix + "metadata"),
        rs.zonedDateTimeOpt(prefix + "updated_on"),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        Nil
      )
  }
}
