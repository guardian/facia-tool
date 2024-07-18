package services.editions.db

import java.time._
import model.editions.internal.PrefillUpdate
import model.editions.{CapiPrefillQuery, Edition, EditionsArticle, EditionsChef, EditionsCollection, PathType}
import model.forms.GetCollectionsFilter
import play.api.libs.json.Json
import scalikejdbc._
import services.editions.DbEditionsCard
import services.editions.prefills.CapiQueryTimeWindow

trait CollectionsQueries {

  def getCollections(filters: List[GetCollectionsFilter]) = DB readOnly { implicit session =>
    case class TypedFilters(id: String, updatedAt: Option[OffsetDateTime])

    val sqlFilters = filters.map { f =>
      TypedFilters(
        f.id,
        f.lastUpdated.map(
          Instant.ofEpochMilli(_).atOffset(ZoneOffset.UTC)
        )
      )
    }

    val rows = fetchCollectionsSql(where =
      sqls"""
      EXISTS (
        SELECT *
        FROM (VALUES ${sqlFilters.map(f => sqls"(${f.id}, ${f.updatedAt})")}) AS F(id, updated_on)
        WHERE collections.id = F.id AND (F.updated_on IS NULL OR collections.updated_on > F.updated_on::TIMESTAMPTZ)
      )
    """).apply()

    convertRowsToCollections(rows)
  }

  def getCollectionPrefill(id: String) = DB readOnly { implicit session =>
    val rows =
      sql"""
          SELECT collections.prefill,
                 collections.path_type,
                 collections.content_prefill_window_start,
                 collections.content_prefill_window_end,
                 cards.id,
                 edition_issues.name,
                 edition_issues.issue_date,
                 edition_issues.timezone_id
          FROM collections
          LEFT JOIN cards ON (collections.id = cards.collection_id)
          JOIN fronts ON (collections.front_id = fronts.id)
          JOIN edition_issues ON (fronts.issue_id = edition_issues.id)
          WHERE collections.id = $id
       """.map { rs =>
        val date = rs.localDate("issue_date")
        val editionStr = rs.string("name")
        val edition = Edition.withName(editionStr)
        val zone = ZoneId.of(rs.string("timezone_id"))
        val pathTypeStr = rs.string("path_type")
        val pathType = PathType.withName(pathTypeStr)
        val timeWinStart = rs.zonedDateTime("content_prefill_window_start").toInstant
        val timeWinEnd = rs.zonedDateTime("content_prefill_window_end").toInstant

        val contentPrefillQueryTimeWindow = CapiQueryTimeWindow(timeWinStart, timeWinEnd)

        (date, edition, zone, CapiPrefillQuery(rs.string("prefill"), pathType), contentPrefillQueryTimeWindow, rs.string("id"))
      }.list.apply()

    rows.headOption.map { case (issueDate, edition, zone, prefillQueryUrlSegments, contentPrefillQueryTimeWindow, _) =>
      PrefillUpdate(issueDate, edition, zone, prefillQueryUrlSegments, contentPrefillQueryTimeWindow, rows.map(_._6))
    }
  }

  def updateCollectionName(collection: EditionsCollection): EditionsCollection = DB localTx { implicit session =>
    val lastUpdated = EditionsDB.truncateDateTime(OffsetDateTime.now())
    sql"""
      UPDATE collections
      SET "name" = ${collection.displayName.trim()},
          updated_on = $lastUpdated,
          updated_by = ${collection.updatedBy},
          updated_email = ${collection.updatedEmail}
      WHERE id = ${collection.id}
    """.execute.apply()

    val rows = fetchCollectionsSql(where = sqls"collections.id = ${collection.id}").apply()

    val updatedCollections = convertRowsToCollections(rows)

    // we have filtered on a single id so this list should only contain one collection
    assert(updatedCollections.size == 1, s"Retrieved ${updatedCollections.size} collections from DB but there should be exactly one. Failing fast.")

    updatedCollections.head
  }

  def updateCollection(collection: EditionsCollection): EditionsCollection = DB localTx { implicit session =>
    val lastUpdated = collection.lastUpdated.map(EditionsDB.dateTimeFromMillis)
    sql"""
      UPDATE collections
      SET is_hidden = ${collection.isHidden},
          updated_on = $lastUpdated,
          updated_by = ${collection.updatedBy},
          updated_email = ${collection.updatedEmail}
      WHERE id = ${collection.id}
    """.execute.apply()

    // At the moment we don't do partial updates so simply delete all of them and reinsert.
    sql"""
          DELETE FROM cards WHERE collection_id = ${collection.id}
    """.execute.apply()

    collection.items.zipWithIndex.foreach { case (card, index) =>
      val metadataJson = card match {
        case EditionsArticle(_, _, metadata) => metadata.map(m => Json.toJson(m).toString)
        case EditionsChef(_, _, metadata) => metadata.map(m => Json.toJson(m).toString)
        case _ => "{}"
      }

      val addedOn = EditionsDB.dateTimeFromMillis(card.addedOn)
      sql"""
          INSERT INTO cards (
          collection_id,
          id,
          card_type,
          index,
          added_on,
          metadata
          ) VALUES (${collection.id}, ${card.id}, ${card.cardType.entryName}, $index, $addedOn, $metadataJson::JSONB)
       """.execute.apply()
    }

    val rows = fetchCollectionsSql(where = sqls"collections.id = ${collection.id}").apply()

    val updatedCollections = convertRowsToCollections(rows)

    // we have filtered on a single id so this list should only contain one collection
    assert(updatedCollections.size == 1, s"Retrieved ${updatedCollections.size} collections from DB but there should be exactly one. Failing fast.")

    updatedCollections.head
  }

  private def fetchCollectionsSql(where: SQLSyntax): SQLToList[GetCollectionsRow, HasExtractor] = {
    val sql =
      sql"""
      SELECT
        collections.id,
        collections.front_id,
        collections.index,
        collections.name,
        collections.is_hidden,
        collections.metadata,
        collections.updated_on,
        collections.updated_by,
        collections.updated_email,
        collections.prefill,
        collections.path_type,
        collections.content_prefill_window_start,
        collections.content_prefill_window_end,
        fronts.is_special,

        cards.collection_id AS cards_collection_id,
        cards.id            AS cards_id,
        cards.card_type     AS cards_card_type,
        cards.index         AS cards_index,
        cards.added_on      AS cards_added_on,
        cards.metadata      AS cards_metadata

      FROM collections
      LEFT JOIN cards ON (cards.collection_id = collections.id)
      LEFT JOIN fronts ON (collections.front_id = fronts.id)
      WHERE ${where}
      """
    sql.map { rs =>
      GetCollectionsRow(
        EditionsCollection.fromRow(rs),
        DbEditionsCard.fromRowOpt(rs, "cards_")
      )
    }.toList
  }

  private def convertRowsToCollections(rows: List[GetCollectionsRow]): List[EditionsCollection] = {
    rows.groupBy(_.collection.id).values.toList.map { rowsWithId =>
      val cards = rowsWithId.flatMap(_.card).sortBy(_.index).map(_.card)
      rowsWithId.head.collection.copy(items = cards)
    }
  }

  private case class GetCollectionsRow(collection: EditionsCollection, card: Option[DbEditionsCard])

}
