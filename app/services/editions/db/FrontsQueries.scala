package services.editions.db

import logging.Logging
import model.editions.{EditionsFront, EditionsFrontMetadata}
import services.editions.DbEditionsFront
import scalikejdbc._
import play.api.libs.json._
import com.gu.pandomainauth.model.User
import java.time.OffsetDateTime
import scala.util.Try
import scala.util.Failure
import services.editions.DbEditionsCollection
import services.editions.DbEditionsCard
import model.editions.EditionsCollection

case class FrontAndNestedEntitiesRow(
    front: Option[DbEditionsFront],
    collection: Option[DbEditionsCollection],
    card: Option[DbEditionsCard]
)

trait FrontsQueries extends Logging {
  def updateFrontMetadata(
      id: String,
      metadata: EditionsFrontMetadata
  ): Option[EditionsFrontMetadata] = DB localTx { implicit session =>
    val updatedMetadata =
      metadata.copy(nameOverride = metadata.nameOverride.map(_.trim()))
    sql"""
          UPDATE fronts
          SET metadata = ${updatedMetadata.toPGobject}
          WHERE id = $id
      """.execute.apply()

    sql"""
        SELECT metadata FROM fronts WHERE id = $id
      """
      .map { rs =>
        rs.stringOpt("metadata").map { metadataString =>
          // Throw if we can't parse the metadata to signal to the user that something is broken
          Json.parse(metadataString).validate[EditionsFrontMetadata].get
        }
      }
      .single
      .apply()
      .flatten
  }

  def getFrontMetadata(id: String): EditionsFrontMetadata = DB localTx {
    implicit session =>
      val rawJson =
        sql"""
          SELECT metadata
          from fronts
          WHERE id = $id
      """.map(rs => {
          rs.string("metadata") match {
            case ""        => "{}"
            case s: String => s
          }
        }).single
          .apply()
          .get
      Json.fromJson[EditionsFrontMetadata](Json.parse(rawJson)).get
  }

  // TODO: sihil this should really escalate an error if this is attempted when is_special is false but we don't
  // have a clean way of doing that right now.
  def updateFrontHiddenState(id: String, isHidden: Boolean): Option[Boolean] =
    DB localTx { implicit session =>
      sql"""
         UPDATE fronts
         SET is_hidden = $isHidden
         WHERE id = $id AND is_special = TRUE
       """.execute.apply()

      val newState = sql"""
        SELECT is_hidden, is_special FROM fronts WHERE id = $id
      """
        .map { rs =>
          (rs.boolean("is_hidden"), rs.boolean("is_special"))
        }
        .single
        .apply()

      newState.map { case (isHidden, isSpecial) =>
        if (!isSpecial)
          logger.warn(
            s"Tried to update hidden state on front $id which is not a special front"
          )
        isHidden
      }
    }

  def getFront(
      frontId: String
  )(implicit session: DBSession): Option[EditionsFront] = {
    val rows: List[FrontAndNestedEntitiesRow] =
      sql"""
        SELECT
        ${FrontsQueries.frontAndNestedEntitiesColumns}
        FROM fronts
        LEFT JOIN collections ON (collections.front_id = fronts.id)
        LEFT JOIN cards ON (cards.collection_id = collections.id)
        WHERE fronts.id = $frontId
      """
        .map { rs =>
          FrontAndNestedEntitiesRow(
            DbEditionsFront.fromRowOpt(rs, "fronts_"),
            DbEditionsCollection.fromRowOpt(rs, "collections_"),
            DbEditionsCard.fromRowOpt(rs, "cards_")
          )
        }
        .list
        .apply()

    FrontsQueries.toEditionsFront(rows).headOption
  }
}

object FrontsQueries {
  def toEditionsFront(
      rows: List[FrontAndNestedEntitiesRow]
  ): List[EditionsFront] = {
    rows
      .flatMap(_.front)
      .sortBy(_.index)
      .map(_.front)
      .distinctBy(_.id)
      .map { front =>
        val collectionsForFront = rows
          .flatMap { _.collection.filter(_.frontId == front.id) }
          .sortBy(_.index)
          .map(_.collection)
          .foldLeft(List.empty[EditionsCollection]) { (acc, cur) =>
            if (acc.exists(c => c.id == cur.id)) acc else acc :+ cur
          }
          .map { collection =>
            val cards = rows
              .flatMap(_.card.filter(_.collectionId == collection.id))
              .sortBy(_.index)
              .map(_.card)

            collection
              .copy(items = cards)
          }

        front.copy(collections = collectionsForFront)
      }
  }

  val frontAndNestedEntitiesColumns = sqls"""
      fronts.id            AS fronts_id,
      fronts.issue_id      AS fronts_issue_id,
      fronts.index         AS fronts_index,
      fronts.name          AS fronts_name,
      fronts.is_special    AS fronts_is_special,
      fronts.is_hidden     AS fronts_is_hidden,
      fronts.metadata      AS fronts_metadata,
      fronts.updated_on    AS fronts_updated_on,
      fronts.updated_by    AS fronts_updated_by,
      fronts.updated_email AS fronts_updated_email,

      collections.id            AS collections_id,
      collections.front_id      AS collections_front_id,
      collections.index         AS collections_index,
      collections.name          AS collections_name,
      collections.is_hidden     AS collections_is_hidden,
      collections.metadata      AS collections_metadata,
      collections.updated_on    AS collections_updated_on,
      collections.updated_by    AS collections_updated_by,
      collections.updated_email AS collections_updated_email,
      collections.prefill       AS collections_prefill,
      collections.path_type     AS collections_path_type,
      collections.content_prefill_window_start       AS collections_content_prefill_window_start,
      collections.content_prefill_window_end         AS collections_content_prefill_window_end,
      collections.targeted_regions   AS collections_targeted_regions,
      collections.excluded_regions   AS collections_excluded_regions,

      cards.collection_id AS cards_collection_id,
      cards.id            AS cards_id,
      cards.card_type     AS cards_card_type,
      cards.index         AS cards_index,
      cards.added_on      AS cards_added_on,
      cards.metadata      AS cards_metadata
  """
}
