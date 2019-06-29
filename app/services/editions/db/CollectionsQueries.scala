package services.editions.db

import java.time._

import model.editions.EditionsCollection
import model.forms.GetCollectionsFilter
import play.api.libs.json.Json
import scalikejdbc._
import services.editions.DbEditionsArticle
import services.editions.CollectionsHelpers._

trait CollectionsQueries {
  def getCollections(filters : List[GetCollectionsFilter]) = DB readOnly { implicit session =>
    case class TypedFilters(id: String, updatedAt: Option[ZonedDateTime])
    case class GetCollectionsRow(collection: EditionsCollection, article: Option[DbEditionsArticle])

    val sqlFilters = filters.map { f =>
      // We add a single millisecond here because the precision in the database is higher than what the client
      // provides (μs in the DB vs ms from the client) so the clients value is effectively truncated.
      //
      // Rather than fiddle with timestamp resolution in the query in the database which would affect our
      // indexing strategy we can just add a single millisecond here.
      TypedFilters(
        f.id,
        f.lastUpdated
          .map(
            Instant
              .ofEpochMilli(_)
              .atZone(ZoneId.of("UTC"))
              .plus(Duration.ofMillis(1))))
    }

    val rows = sql"""
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

        articles.collection_id AS articles_collection_id,
        articles.page_code     AS articles_page_code,
        articles.index         AS articles_index,
        articles.added_on      AS articles_added_on,
        articles.metadata      AS articles_metadata

      FROM collections
      LEFT JOIN articles ON (articles.collection_id = collections.id)
      WHERE EXISTS (
        SELECT *
        FROM (VALUES ${sqlFilters.map(f => sqls"(${f.id}, ${f.updatedAt})")}) AS F(id, updated_on)
        WHERE collections.id = F.id AND (F.updated_on IS NULL OR collections.updated_on > F.updated_on::TIMESTAMPTZ)
      )
      """.map { rs =>
      GetCollectionsRow(
        EditionsCollection.fromRow(rs),
        DbEditionsArticle.fromRowOpt(rs, "articles_"))
    }
      .list()
      .apply()

    rows
      .map(_.collection)
      .distinctBy(_.id)
      .map { collection =>
          val articles = rows
            .flatMap(_.article)
            .filter(_.collectionId == collection.id)
            .sortBy(_.index)
            .map(_.article)
        collection.copy(items = articles)
      }
  }

  def updateCollection(collection: EditionsCollection): EditionsCollection  = DB localTx { implicit session =>
    sql"""
      UPDATE collections
      SET is_hidden = ${collection.isHidden},
          updated_on = NOW(),
          updated_by = ${collection.updatedBy},
          updated_email = ${collection.updatedEmail}
      WHERE id = ${collection.id}
    """.execute().apply

    // At the moment we don't do partial updates so simply delete all of them and reinsert.
    sql"""
          DELETE FROM articles WHERE collection_id = ${collection.id}
    """.execute().apply()

    collection.items.zipWithIndex.foreach { case (article, index) =>
      sql"""
          INSERT INTO articles (
          collection_id,
          page_code,
          index,
          added_on,
          metadata
          ) VALUES (${collection.id}, ${article.pageCode}, $index, now(), ${article.metadata.map(m => Json.toJson(m).toString)}::JSONB)
       """.execute().apply()
    }

    collection
  }
}
