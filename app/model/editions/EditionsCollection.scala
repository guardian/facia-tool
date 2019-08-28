package model.editions

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet

case class EditionsCollection(
                               id: String,
                               displayName: String,
                               isHidden: Boolean,
                               lastUpdated: Option[Long],
                               updatedBy: Option[String],
                               updatedEmail: Option[String],
                               prefill: Option[CapiPrefillQuery],
                               items: List[EditionsArticle],
                             ) {
  def toPublishedCollection: PublishedCollection = PublishedCollection(
    id,
    displayName,
    items.map(_.toPublishedArticle)
  )
}

object EditionsCollection {
  implicit val format = Json.format[EditionsCollection]

  def fromRow(rs: WrappedResultSet, prefix: String = ""): EditionsCollection = {
    val capiPrefillQuery: Option[CapiPrefillQuery] =
      createMaybeCapiPrefillQuery(rs.stringOpt(prefix + "prefill"), rs.stringOpt(prefix + "path_type"))
    EditionsCollection(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      capiPrefillQuery,
      Nil
    )
  }

  private def createMaybeCapiPrefillQuery(maybePrefill: Option[String], maybePathType: Option[String]): Option[CapiPrefillQuery] = {
    (maybePrefill, maybePathType) match {
      case (Some(prefill), Some(pathType)) => Some(CapiPrefillQuery(prefill, PathType.withName(pathType)))
      case _ => None
    }
  }

  def fromRowOpt(rs: WrappedResultSet, prefix: String = ""): Option[EditionsCollection] = {
    for {
      id <- rs.stringOpt(prefix + "id")
      name <- rs.stringOpt(prefix + "name")
      isHidden <- rs.booleanOpt(prefix + "is_hidden")
    } yield {
      val capiPrefillQuery: Option[CapiPrefillQuery] =
        createMaybeCapiPrefillQuery(rs.stringOpt(prefix + "prefill"), rs.stringOpt(prefix + "path_type"))

      EditionsCollection(
        id,
        name,
        isHidden,
        rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        capiPrefillQuery,
        Nil
      )
    }
  }
}
