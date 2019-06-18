package model.editions

import java.time.ZonedDateTime

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsArticle(pageCode: String,
                           addedOn: Long,
                           addedBy: String,
                           addedEmail: String)

object EditionsArticle {
  implicit val writes = Json.writes[EditionsArticle]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsArticle = {
    EditionsArticle(
      rs.string(prefix + "page_code"),
      rs.zonedDateTime(prefix + "added_on").toInstant.toEpochMilli,
      rs.string(prefix + "added_by"),
      rs.string(prefix + "added_email"),
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsArticle] = {
    for {
      pageCode <- rs.stringOpt(prefix + "page_code")
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
      addedBy <- rs.stringOpt(prefix + "added_by")
      addedEmail <- rs.stringOpt(prefix + "added_email")
    } yield EditionsArticle(pageCode, addedOn, addedBy, addedEmail)
  }
}
