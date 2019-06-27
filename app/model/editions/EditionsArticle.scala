package model.editions

import com.gu.editions.PublishedArticle
import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsArticle(pageCode: String, addedOn: Long) {
  def toPublishedArticle(): PublishedArticle = PublishedArticle(
    pageCode.toLong,
    None
  )
}

object EditionsArticle {
  implicit val writes = Json.format[EditionsArticle]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsArticle = {
    EditionsArticle(
      rs.string(prefix + "page_code"),
      rs.zonedDateTime(prefix + "added_on").toInstant.toEpochMilli
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsArticle] = {
    for {
      pageCode <- rs.stringOpt(prefix + "page_code")
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
    } yield EditionsArticle(pageCode, addedOn)
  }
}
