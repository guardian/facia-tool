package services.editions

import java.time.{Instant, ZoneId, ZonedDateTime}

import services.editions.CollectionsHelpers._
import model.editions._
import model.forms.GetCollectionsFilter
import scalikejdbc._


trait CollectionsQueries {
  def getCollections(filters : List[GetCollectionsFilter]) = DB readOnly { implicit session =>
    case class TypedFilters(id: String, updatedAt: Option[ZonedDateTime])
    case class GetCollectionsRow(collection: EditionsCollection, article: Option[DbEditionsArticle])

    val sqlFilters = filters.map { f =>
      TypedFilters(f.id, f.lastUpdated.map(Instant.ofEpochMilli(_).atZone(ZoneId.of("UTC"))))
    }

    val rows: List[GetCollectionsRow] = sql"""
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
        articles.added_by      AS articles_added_by,
        articles.added_email   AS articles_added_email

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
            .map(_.article)
        collection.copy(items = articles)
      }
  }
}
