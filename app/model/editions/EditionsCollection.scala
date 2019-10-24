package model.editions

import java.time.ZonedDateTime

import play.api.libs.json.Json
import scalikejdbc.WrappedResultSet
import services.editions.prefills.CapiQueryTimeWindow

case class EditionsCollection(
                               id: String,
                               displayName: String,
                               isHidden: Boolean,
                               lastUpdated: Option[Long],
                               updatedBy: Option[String],
                               updatedEmail: Option[String],
                               prefill: Option[CapiPrefillQuery],
                               contentPrefillTimeWindow: Option[CapiQueryTimeWindow],
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
    val contentPrefillTimeWindow =
      createMaybeCapiQueryTime(rs.zonedDateTimeOpt("content_prefill_window_start"), rs.zonedDateTimeOpt("content_prefill_window_end"))
    EditionsCollection(
      rs.string(prefix + "id"),
      rs.string(prefix + "name"),
      rs.boolean(prefix + "is_hidden"),
      rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
      rs.stringOpt(prefix + "updated_by"),
      rs.stringOpt(prefix + "updated_email"),
      capiPrefillQuery,
      contentPrefillTimeWindow,
      Nil
    )
  }

  private def createMaybeCapiPrefillQuery(maybePrefill: Option[String], maybePathType: Option[String]): Option[CapiPrefillQuery] = {
    (maybePrefill, maybePathType) match {
      case (Some(prefill), Some(pathType)) => Some(CapiPrefillQuery(prefill, PathType.withName(pathType)))
      case _ => None
    }
  }

  private def createMaybeCapiQueryTime(maybeStart: Option[ZonedDateTime], maybeEnd: Option[ZonedDateTime]): Option[CapiQueryTimeWindow] = {
    (maybeStart, maybeEnd) match {
      case (Some(start), Some(end)) => Some(CapiQueryTimeWindow(start.toInstant, end.toInstant))
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

      val contentPrefillTimeWindow =
        createMaybeCapiQueryTime(rs.zonedDateTimeOpt(prefix + "content_prefill_window_start"), rs.zonedDateTimeOpt(prefix + "content_prefill_window_end"))

      EditionsCollection(
        id,
        name,
        isHidden,
        rs.zonedDateTimeOpt(prefix + "updated_on").map(_.toInstant.toEpochMilli),
        rs.stringOpt(prefix + "updated_by"),
        rs.stringOpt(prefix + "updated_email"),
        capiPrefillQuery,
        contentPrefillTimeWindow,
        Nil
      )
    }
  }
}
