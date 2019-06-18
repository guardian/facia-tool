package services.editions

import java.time.LocalDate

import com.gu.pandomainauth.model.User
import model.editions._
import scalikejdbc._

// Little helpers so we don't contaminate our business model with relational data
case class DbEditionsFront(front: EditionsFront, issueId: String, index: Int)
object DbEditionsFront {
  def fromRowOpt(rs: WrappedResultSet): Option[DbEditionsFront] = {
    EditionsFront.fromRowOpt(rs, "fronts_").map { front =>
      DbEditionsFront(front, rs.string("fronts_issue_id"), rs.int("fronts_index"))
    }
  }
}

case class DbEditionsCollection(collection: EditionsCollection, frontId: String, index: Int)
object DbEditionsCollection {
  def fromRowOpt(rs: WrappedResultSet): Option[DbEditionsCollection] = {
    EditionsCollection.fromRowOpt(rs, "collections_").map { collection =>
      DbEditionsCollection(collection, rs.string("collections_front_id"), rs.int("collections_index"))
    }
  }
}

case class DbEditionsArticle(article: EditionsArticle, collectionId: String, index: Int)
object DbEditionsArticle {
  def fromRowOpt(rs: WrappedResultSet): Option[DbEditionsArticle] = {
    EditionsArticle.fromRowOpt(rs, "articles_").map { article =>
      DbEditionsArticle(
        article,
        rs.string("articles_collection_id"),
        rs.int("articles_index"))
    }
  }
}

trait IssueQueries {

  def insertIssue(
                   name: String,
                   skeleton: EditionsIssueSkeleton,
                   user: User
  ): String  = DB localTx { implicit session =>
    val issueId = sql"""
          INSERT INTO edition_issues (
            name,
            issue_date,
            timezone_id,
            created_on,
            created_by,
            created_email
          ) VALUES ($name, ${skeleton.issueDate}, ${skeleton.zoneId.toString}, now(), ${user.firstName + " " + user.lastName}, ${user.email})
          RETURNING id;
       """.map(_.string("id")).single().apply().get

    skeleton.fronts.zipWithIndex.foreach { case (front, fIndex) =>
        val frontId = sql"""
        INSERT INTO fronts (
          issue_id,
          index,
          name,
          is_hidden,
          metadata
        ) VALUES (${issueId}, ${fIndex}, ${front.name}, ${front.hidden}, NULL)
        RETURNING id;
      """.map(_.string("id")).single().apply().get

        front.collections.zipWithIndex.foreach { case (collection, cIndex) =>
          val collectionId = sql"""
          INSERT INTO collections (
            front_id,
            index,
            name,
            is_hidden,
            metadata,
            prefill
          ) VALUES ($frontId, $cIndex, ${collection.name}, ${collection.hidden}, NULL, ${collection.prefill.map(_.tag)})
          RETURNING id;
          """.execute().apply()

          collection.items.zipWithIndex.foreach { case (pageCode, tIndex) =>
              sql"""
                    INSERT INTO articles (
                    collection_id,
                    page_code,
                    index,
                    added_on,
                    added_by,
                    added_email
                    ) VALUES ($collectionId, $pageCode, $tIndex, now(), ${user.firstName + " " + user.lastName}}, ${user.email})
                 """.execute().apply()
          }
        }
    }

    issueId
  }

  def listIssues(editionName: String, date: LocalDate) = DB readOnly { implicit session =>
    val editionTimeZone = EditionsTemplates.templates(editionName).zoneId

    val zonedIssueDate = date.atStartOfDay(editionTimeZone)

    sql"""
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
    WHERE issue_date = $zonedIssueDate AND name = $editionName
    """.map(EditionsIssue.fromRow(_)).list().apply()
  }

  def getIssue(name: String, id: String): Option[EditionsIssue] = DB readOnly { implicit session =>
      case class GetIssueRow(
          issue: EditionsIssue,
          front: Option[DbEditionsFront],
          collection: Option[DbEditionsCollection],
          article: Option[DbEditionsArticle]
      )

      val rows: List[GetIssueRow] = sql"""
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

        articles.collection_id AS articles_collection_id,
        articles.page_code     AS articles_page_code,
        articles.added_on      AS articles_added_on,
        articles.added_by      AS articles_added_by,
        articles.added_email   AS articles_added_email

      FROM edition_issues
      LEFT JOIN fronts ON (fronts.issue_id = edition_issues.id)
      LEFT JOIN collections ON (collections.front_id = fronts.id)
      LEFT JOIN articles ON (articles.collection_id = collections.id)
      WHERE edition_issues.id = $id AND edition_issues.name = $name
      """.map { rs =>
            GetIssueRow(
              EditionsIssue.fromRow(rs),
              DbEditionsFront.fromRowOpt(rs),
              DbEditionsCollection.fromRowOpt(rs),
              DbEditionsArticle.fromRowOpt(rs))
        }
        .list()
        .apply()

    val fronts: List[EditionsFront] = rows
        .flatMap(row => row.front)
        .sortBy(_.index)
        .map(_.front)
        .foldLeft(List.empty[EditionsFront]) {(acc, cur) => if(acc.exists(f => f.id == cur.id)) acc else acc :+ cur}
        .map { front  =>
          val collectionsForFront = rows
            .flatMap(row => row.collection.filter(_.frontId == front.id))
            .sortBy(_.index)
            .map { collection =>
              val articles = rows
                .flatMap(row => row.article.filter(_.collectionId == collection.collection.id))
                .sortBy(_.index)
                .map(_.article)

              collection.collection.copy(
                items = articles
              )
            }

          front.copy(collections = collectionsForFront)
        }

    rows.headOption.map(_.issue.copy(fronts = fronts))
  }
}
