package model.editions

import com.gu.editions.{PublishedArticle, PublishedFurniture}
import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class ArticleMetadata(headline: Option[String])

object ArticleMetadata {
  implicit val format = Json.format[ArticleMetadata]
}

case class EditionsArticle(pageCode: String, addedOn: Long, metadata: Option[ArticleMetadata]) {
  def toPublishedArticle: PublishedArticle = PublishedArticle(
    pageCode.toLong,
    PublishedFurniture(None, metadata.flatMap(_.headline), None) // TODO (sihil): Store in DB and populate here
  )
}

object EditionsArticle {
  implicit val writes = Json.format[EditionsArticle]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsArticle = {
    EditionsArticle(
      rs.string(prefix + "page_code"),
      rs.zonedDateTime(prefix + "added_on").toInstant.toEpochMilli,
      rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[ArticleMetadata].get)
    )
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsArticle] = {
    for {
      pageCode <- rs.stringOpt(prefix + "page_code")
      addedOn <- rs.zonedDateTimeOpt(prefix + "added_on").map(_.toInstant.toEpochMilli)
    } yield
      EditionsArticle(
        pageCode,
        addedOn,
        rs.stringOpt(prefix + "metadata").map(s => Json.parse(s).validate[ArticleMetadata].get)
      )
  }
}
