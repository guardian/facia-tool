package services.editions.db

import java.time._
import model.editions.internal.PrefillUpdate
import model.editions.{
  CapiPrefillQuery,
  Edition,
  EditionsArticle,
  EditionsCard,
  EditionsChef,
  EditionsCollection,
  EditionsFeastCollection,
  PathType
}
import model.forms.GetCollectionsFilter
import play.api.libs.json.Json
import scalikejdbc._
import services.editions.DbEditionsCard
import services.editions.prefills.CapiQueryTimeWindow
import play.api.libs.json.Writes
import com.gu.pandomainauth.model.User
import logging.Logging

import scala.util.Try
import model.editions.CuratedPlatform.Editions

trait CollectionsQueries extends Logging {

  def getCollections(filters: List[GetCollectionsFilter]) = DB readOnly {
    implicit session =>
      case class TypedFilters(id: String, updatedAt: Option[OffsetDateTime])

      val sqlFilters = filters.map { f =>
        TypedFilters(
          f.id,
          f.lastUpdated.map(
            Instant.ofEpochMilli(_).atOffset(ZoneOffset.UTC)
          )
        )
      }

      val rows = fetchCollectionsSql(where = sqls"""
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
       """
        .map { rs =>
          val date = rs.localDate("issue_date")
          val editionStr = rs.string("name")
          val edition = Edition.withName(editionStr)
          val zone = ZoneId.of(rs.string("timezone_id"))
          val pathTypeStr = rs.string("path_type")
          val pathType = PathType.withName(pathTypeStr)
          val timeWinStart =
            rs.zonedDateTime("content_prefill_window_start").toInstant
          val timeWinEnd =
            rs.zonedDateTime("content_prefill_window_end").toInstant

          val contentPrefillQueryTimeWindow =
            CapiQueryTimeWindow(timeWinStart, timeWinEnd)

          (
            date,
            edition,
            zone,
            CapiPrefillQuery(rs.string("prefill"), pathType),
            contentPrefillQueryTimeWindow,
            rs.string("id")
          )
        }
        .list
        .apply()

    rows.headOption.map {
      case (
            issueDate,
            edition,
            zone,
            prefillQueryUrlSegments,
            contentPrefillQueryTimeWindow,
            _
          ) =>
        PrefillUpdate(
          issueDate,
          edition,
          zone,
          prefillQueryUrlSegments,
          contentPrefillQueryTimeWindow,
          rows.map(_._6)
        )
    }
  }

  def updateCollectionName(collection: EditionsCollection): EditionsCollection =
    DB localTx { implicit session =>
      val lastUpdated = EditionsDB.truncateDateTime(OffsetDateTime.now())
      sql"""
      UPDATE collections
      SET "name" = ${collection.displayName.trim()},
          updated_on = $lastUpdated,
          updated_by = ${collection.updatedBy},
          updated_email = ${collection.updatedEmail}
      WHERE id = ${collection.id}
    """.execute.apply()

      val rows = fetchCollectionsSql(where =
        sqls"collections.id = ${collection.id}"
      ).apply()

      val updatedCollections = convertRowsToCollections(rows)

      // we have filtered on a single id so this list should only contain one collection
      assert(
        updatedCollections.size == 1,
        s"Retrieved ${updatedCollections.size} collections from DB but there should be exactly one. Failing fast."
      )

      updatedCollections.head
    }

  /** Move the collection to the given index, updating the index values for the
    * other collections in that front to ensure a contiguous range.
    */
  def moveCollectionToIndex(collectionId: String, newIndex: Int)(implicit
      session: DBSession
  ): Either[Error, Unit] =
    for {
      currentCollectionIds <- getCollectionIdsInFrontFromCollectionId(
        collectionId
      )
    } yield {
      currentCollectionIds.indexOf(collectionId) match {
        case -1 =>
          Left(
            EditionsDB.NotFoundError(
              s"Tried to move collection $collectionId to $newIndex, but could not find collection with that ID"
            )
          )
        case currentIndex if currentIndex == newIndex =>
          logger.info(s"Collection $collectionId is already at index $newIndex")
          Right(()) // No move
        case currentIndex =>
          logger.info(
            s"Moving $collectionId at $currentIndex to index $newIndex"
          )
          val newCollectionIds = currentCollectionIds
            .filter(_ != collectionId)
            .patch(newIndex, List(collectionId), 0)

          updateCollectionIndices(newCollectionIds)
      }
    }

  def updateCollection(collection: EditionsCollection): EditionsCollection =
    DB localTx { implicit session =>
      val lastUpdated =
        collection.lastUpdated.map(EditionsDB.dateTimeFromMillis)
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
        val metadataJson = EditionsCard.getMetadataJson(card)

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

      val rows = fetchCollectionsSql(where =
        sqls"collections.id = ${collection.id}"
      ).apply()

      val updatedCollections = convertRowsToCollections(rows)

      // we have filtered on a single id so this list should only contain one collection
      assert(
        updatedCollections.size == 1,
        s"Retrieved ${updatedCollections.size} collections from DB but there should be exactly one. Failing fast."
      )

      updatedCollections.head
    }

  /** Update the indices for a list of collections, setting their index as their
    * position in the given list.
    *
    * @param collectionIds
    *   The list of collectionIds, in order they are to be indexed
    * @param offset
    *   If supplied, offset the indices by this value
    * @return
    */
  protected def updateCollectionIndices(
      collectionIds: List[String],
      offset: Option[Int] = None
  )(implicit session: DBSession): Either[Error, Unit] = {
    logger.info(
      s"Updating collection indices with order ${collectionIds.mkString(",")} at offset $offset"
    )
    Try {
      collectionIds match {
        case Nil => Right(())
        case _ =>
          sql"""
          UPDATE collections
          SET index=CASE
            ${sqls.join(
              collectionIds.zipWithIndex.map { case (id, index) =>
                sqls"""WHEN id=$id THEN ${index + offset.getOrElse(0)}"""
              },
              sqls.empty
            )}
          END
          WHERE id IN (${sqls.join(
              collectionIds.map(id => sqls"$id"),
              sqls","
            )})
        """.update.apply()
      }
    }.toEither match {
      case Left(error) =>
        Left(
          EditionsDB.WriteError(
            s"Could not update collection indices: ${error.getMessage}"
          )
        )
      case Right(_) => Right(())
    }
  }

  private def getCollectionIdsInFrontFromCollectionId(collectionId: String)(
      implicit session: DBSession
  ): Either[Error, List[String]] =
    getCollectionIds(sqls"""
      WHERE front_id = (
        SELECT front_id
        FROM collections
        WHERE id=$collectionId
      )""")

  private def getCollectionIdsInFront(frontId: String)(implicit
      session: DBSession
  ): Either[Error, List[String]] =
    getCollectionIds(sqls"""WHERE front_id = $frontId""")

  private def getCollectionIds(
      where: SQLSyntax
  )(implicit session: DBSession): Either[Error, List[String]] =
    sql"""
      SELECT id
      FROM collections
      $where
      ORDER BY index
    """
      .map(_.string("id"))
      .list
      .apply() match {
      case collectionIds => Right(collectionIds)
    }

  private def maybeJson[T](maybeModel: Option[T])(implicit writes: Writes[T]) =
    maybeModel.map(m => Json.toJson(m).toString)

  private def fetchCollectionsSql(
      where: SQLSyntax
  ): SQLToList[GetCollectionsRow, HasExtractor] = {
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
      WHERE $where
      """
    sql.map { rs =>
      GetCollectionsRow(
        EditionsCollection.fromRow(rs),
        DbEditionsCard.fromRowOpt(rs, "cards_")
      )
    }.toList
  }

  private def convertRowsToCollections(
      rows: List[GetCollectionsRow]
  ): List[EditionsCollection] = {
    rows.groupBy(_.collection.id).values.toList.map { rowsWithId =>
      val cards = rowsWithId.flatMap(_.card).sortBy(_.index).map(_.card)
      rowsWithId.head.collection.copy(items = cards)
    }
  }

  private case class GetCollectionsRow(
      collection: EditionsCollection,
      card: Option[DbEditionsCard]
  )

  /** Insert a collection owned by the specified front.
    *
    * @return
    *   the Collection id
    */
  protected def insertCollection(
      frontId: String,
      collectionIndex: Int,
      name: String,
      now: OffsetDateTime,
      user: User
  )(implicit session: DBSession): Either[Error, String] = {
    logger.info(
      s"Inserting new collection into front $frontId at index $collectionIndex"
    )
    for {
      currentCollectionIds <- getCollectionIdsInFront(frontId)
      maxCollectionIndex = currentCollectionIds.size
      _ <-
        if (collectionIndex > maxCollectionIndex) {
          Left(
            EditionsDB.InvalidInput(
              s"Cannot add a collection at index $collectionIndex (min: 0, max: $maxCollectionIndex"
            )
          )
        } else Right(())
      // Make a gap in the index for the new collection
      _ <- updateCollectionIndices(
        currentCollectionIds.slice(collectionIndex, currentCollectionIds.size),
        Some(collectionIndex + 1)
      )
      id <- Try {
        sql"""
        INSERT INTO collections (
          front_id,
          index,
          name,
          is_hidden,
          updated_on,
          updated_by,
          updated_email
        ) VALUES (
          $frontId
          , $collectionIndex
          , $name
          , FALSE
          , $now
        , ${EditionsDB.getUserName(user)}
          , ${user.email}
        )
        RETURNING id;
      """.map(_.string("id"))
          .single
          .apply()
          .toRight(
            EditionsDB.WriteError("Could not write new collection to database")
          )
      }.toEither.left.map { error =>
        EditionsDB.WriteError(error.getMessage)
      }.flatten
    } yield id
  }

  /** Delete a collection.
    */
  protected def deleteCollection(
      collectionId: String,
      now: OffsetDateTime,
      user: User
  )(implicit session: DBSession): Either[Error, Unit] =
    Try {
      sql"""DELETE FROM collections WHERE id=$collectionId"""
        .map(_.string("id"))
        .update
        .apply()
    }.toEither match {
      case Right(1) => Right(())
      case Right(_) =>
        Left(
          EditionsDB.NotFoundError(s"Collection ${collectionId} was not found")
        )
      case Left(error) => Left(EditionsDB.WriteError(error.getMessage()))
    }
}
