package services.editions.db

import java.time.format.DateTimeFormatter
import java.time.{LocalDate, OffsetDateTime, ZoneId}

import com.gu.pandomainauth.model.User
import logging.Logging
import model.editions._
import org.postgresql.util.PSQLException
import play.api.libs.json.Json
import scalikejdbc._
import services.editions.publishing.events.PublishEvent
import services.editions.{DbEditionsCard, DbEditionsCollection, DbEditionsFront, GenerateEditionTemplateResult}

import scala.util.{Failure, Success, Try}

trait IssueQueries extends Logging {

  def insertIssue(
                   edition: Edition,
                   genEditionTemplateResult: GenerateEditionTemplateResult,
                   user: User,
                   now: OffsetDateTime
                 ): String = DB localTx { implicit session =>
    val userName = user.firstName + " " + user.lastName
    val truncatedNow = EditionsDB.truncateDateTime(now)

    import genEditionTemplateResult.{issueSkeleton, contentPrefillTimeWindow}

    val issueId =
      sql"""
          INSERT INTO edition_issues (
            name,
            issue_date,
            timezone_id,
            created_on,
            created_by,
            created_email
          ) VALUES (${edition.entryName}, ${issueSkeleton.issueDate}, ${issueSkeleton.zoneId.toString}, $truncatedNow, $userName, ${user.email})
          RETURNING id;
       """.map(_.string("id")).single.apply().get

    issueSkeleton.fronts.zipWithIndex.foreach { case (front, fIndex) =>
      val frontId =
        sql"""
        INSERT INTO fronts (
          issue_id,
          index,
          name,
          is_hidden,
          metadata,
          is_special
        ) VALUES (${issueId}, ${fIndex}, ${front.name}, ${front.hidden}, ${front.metadata()}, ${front.isSpecial})
        RETURNING id;
      """.map(_.string("id")).single.apply().get

      import contentPrefillTimeWindow.{fromDate, toDate}

      front.collections.zipWithIndex.foreach { case (collection, cIndex) =>
        val collectionId =
          sql"""
          INSERT INTO collections (
            front_id,
            index,
            name,
            is_hidden,
            metadata,
            prefill,
            path_type,
            content_prefill_window_start,
            content_prefill_window_end,
            updated_on,
            updated_by,
            updated_email
          ) VALUES (
            $frontId
            , $cIndex
            , ${collection.name}
            , ${collection.hidden}
            , NULL
            , ${collection.prefill.map(_.queryString)}
            , ${collection.prefill.map(_.pathType.entryName)}
            , ${collection.capiQueryTimeWindow.fromDate}
            , ${collection.capiQueryTimeWindow.toDate}
            , $truncatedNow
            , $userName
            , ${user.email}
            )
          RETURNING id;
          """.map(_.string("id")).single.apply().get

        collection.items.zipWithIndex.foreach { case (card, tIndex) =>
          sql"""
                    INSERT INTO cards (
                    collection_id,
                    id,
                    index,
                    added_on,
                    metadata
                    ) VALUES ($collectionId, ${card.id}, $tIndex, $truncatedNow, ${Json.toJson(card.metadata).toString}::JSONB)
                 """.execute.apply()
        }
      }
    }

    issueId
  }

  def listIssues(edition: Edition, dateFrom: LocalDate, dateTo: LocalDate) = DB readOnly { implicit session =>
    val maybeIssues = sql"""
      SELECT
        id,
        name,
        issue_date,
        timezone_id,
        created_on,
        created_by,
        created_email,
        launched_on,
        launched_by,
        launched_email
      FROM edition_issues
      WHERE issue_date BETWEEN $dateFrom AND $dateTo AND name = ${edition.entryName}
      """.map(EditionsIssue.fromRow(_)).list.apply()

    maybeIssues.partitionMap(identity) match {
      case (Nil, rights) => Right(rights)
      case (lefts, _) => Left(lefts)
    }
  }

  def getIssueIdFromCollectionId(collectionId: String): Option[String] = DB readOnly { implicit session =>
    sql"""
    SELECT edition_issues.id AS id
    FROM edition_issues
    INNER JOIN fronts ON (fronts.issue_id = edition_issues.id)
    INNER JOIN collections ON (collections.front_id = fronts.id)
    WHERE collections.id = $collectionId
    """.map { rs =>
      rs.string("id")
    }.toOption.apply()
  }

  def getIssue(id: String): Option[EditionsIssue] = DB readOnly { implicit session =>
    case class GetIssueRow(
                            issue: EditionsIssue,
                            front: Option[DbEditionsFront],
                            collection: Option[DbEditionsCollection],
                            card: Option[DbEditionsCard]
                          )

    val rows: List[GetIssueRow] =
      sql"""
      SELECT
        edition_issues.id,
        edition_issues.name,
        edition_issues.timezone_id,
        edition_issues.issue_date,
        edition_issues.created_on,
        edition_issues.created_by,
        edition_issues.created_email,
        edition_issues.launched_on,
        edition_issues.launched_by,
        edition_issues.launched_email,

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

        cards.collection_id AS cards_collection_id,
        cards.id            AS cards_id,
        cards.card_type     AS cards_card_type,
        cards.index         AS cards_index,
        cards.added_on      AS cards_added_on,
        cards.metadata      AS cards_metadata

      FROM edition_issues
      LEFT JOIN fronts ON (fronts.issue_id = edition_issues.id)
      LEFT JOIN collections ON (collections.front_id = fronts.id)
      LEFT JOIN cards ON (cards.collection_id = collections.id)
      WHERE edition_issues.id = $id
      """.map { rs =>
          EditionsIssue.fromRow(rs).toOption.map { issue => GetIssueRow(
            issue,
            DbEditionsFront.fromRowOpt(rs, "fronts_"),
            DbEditionsCollection.fromRowOpt(rs, "collections_"),
            DbEditionsCard.fromRowOpt(rs, "cards_"))
        }
      }
        .list
        .apply()
        .flatten

    val fronts: List[EditionsFront] = rows
      .flatMap(row => row.front)
      .sortBy(_.index)
      .map(_.front)
      .distinctBy(_.id)
      .map { front =>
        val collectionsForFront = rows
          .flatMap(row => row.collection.filter(_.frontId == front.id))
          .sortBy(_.index)
          .map(_.collection)
          .foldLeft(List.empty[EditionsCollection]) { (acc, cur) => if (acc.exists(c => c.id == cur.id)) acc else acc :+ cur }
          .map { collection =>
            val cards = rows
              .flatMap(row => row.card.filter(_.collectionId == collection.id))
              .sortBy(_.index)
              .map(_.card)

            collection
              .copy(items = cards)
          }

        front.copy(collections = collectionsForFront)
      }

    rows.headOption.map(_.issue.copy(fronts = fronts))
  }

  def getIssueSummary(id: String): Option[Either[String, EditionsIssue]] = DB readOnly { implicit session =>
    sql"""
       SELECT
         edition_issues.id,
         edition_issues.name,
         edition_issues.timezone_id,
         edition_issues.issue_date,
         edition_issues.created_on,
         edition_issues.created_by,
         edition_issues.created_email,
         edition_issues.launched_on,
         edition_issues.launched_by,
         edition_issues.launched_email
       FROM edition_issues
       WHERE edition_issues.id = $id
       """
      .map(rs => EditionsIssue.fromRow(rs))
      .single
      .apply()
  }

  def createIssueVersion(issueId: String, user: User, now: OffsetDateTime): EditionIssueVersionId = DB localTx { implicit session =>
    val userName = user.firstName + " " + user.lastName
    val truncatedNow = EditionsDB.truncateDateTime(now)

    // versionId is a date string but everything downstream treats it as a string
    // until we get back to the fronts tool
    val versionId:String = now.format(DateTimeFormatter.ISO_DATE_TIME)

    sql"""
    UPDATE edition_issues
    SET launched_on = $truncatedNow,
        launched_by = $userName,
        launched_email = ${user.email}
    WHERE id = $issueId
    """.execute.apply()

    sql"""
    INSERT INTO issue_versions (
      id
      , issue_id
      , launched_on
      , launched_by
      , launched_email
    ) VALUES (
      $versionId
      , $issueId
      , $truncatedNow
      , $userName
      , ${user.email}
    );
    """.execute.apply()

    sql"""
    INSERT INTO issue_versions_events (
      version_id
      , event_time
      , status
    ) VALUES (
      $versionId
      , $truncatedNow
      , ${IssueVersionStatus.Started.toString}
    )
    RETURNING version_id;
    """.map(_.string("version_id")).single.apply().get
  }

  def deleteIssue(issueId: String) = DB localTx { implicit session =>
    sql"""
      DELETE FROM edition_issues
      WHERE id = $issueId
    """.execute.apply()
  }



  def getLastProofedIssueVersion(issueId: String): Option[EditionIssueVersionId] = DB localTx { implicit session =>

      sql"""
      SELECT max(v.id)                AS version_id
      FROM issue_versions v
      LEFT JOIN issue_versions_events e
        ON v.id = e.version_id
      WHERE v.issue_id = $issueId
      AND   e.status = ${IssueVersionStatus.Proofed.toString}
    """.map(rs => rs.string("version_id"))
        .list
        .apply()
        .headOption

  }

  def getIssueVersions(issueId: String): List[IssueVersion] = DB localTx { implicit session =>
    case class Row(version: IssueVersion, event: IssueVersionEvent)

    val rows: List[Row] =
      sql"""
      SELECT
        v.id                AS version_id
        , v.launched_on     AS version_launched_on
        , v.launched_by     AS version_launched_by
        , v.launched_email  AS version_launched_email
        , e.event_time      AS event_time
        , e.status          AS event_status
        , e.message         AS event_message
      FROM issue_versions v
      LEFT JOIN issue_versions_events e
        ON v.id = e.version_id
      WHERE v.issue_id = $issueId
      ORDER BY launched_on DESC
    """.map(rs => Row(IssueVersion.fromRow(rs), IssueVersionEvent.fromRow(rs)))
        .list
        .apply()

    (rows.groupBy(_.version) map {
      case (version, rows) => version.copy(events = rows.map(_.event).sortBy(_.eventTime))
    }).toList
      .sortBy(_.launchedOn)
      .reverse
  }

  def insertIssueVersionEvent(event: PublishEvent): Try[Unit] = DB localTx { implicit session =>
    val maybeInsertEvent = Try {
      logger.info(s"Saving issue version event with status: ${event.status} and message: ${event.message} to version: ${event.version} with timestamp: ${event.timestamp}")(event.toLogMarker)
      sql"""
        INSERT INTO issue_versions_events (
          version_id
          , event_time
          , status
          , message
        )
        VALUES (
          ${event.version}
          , ${event.timestamp}
          , ${event.status.toString}
          , ${event.message}
        );
      """.execute.apply()
    }

    maybeInsertEvent match {
      case Success(true) =>
        logger.info(s"successfully inserted issue version event message:${event.message}")(event.toLogMarker)
      case Success(false) =>
        logger.warn("Attempted to insert issue, but ")(event.toLogMarker)
      case Failure(exception: PSQLException) if exception.getSQLState == ForeignKeyViolationSQLState =>
        logger.warn("Foreign key constraint violation encountered when inserting issue version event")(event.toLogMarker)
      case Failure(exception: PSQLException)  =>
        logger.warn(s"Postgres exception (${exception.getMessage}) encountered when inserting issue version event")(event.toLogMarker)
      case Failure(exception) =>
        logger.warn(s"Non-database exception (${exception.getMessage}) encountered when inserting issue version event")(event.toLogMarker)
    }

    maybeInsertEvent.map { _ => () }
  }
}
