package services.editions

import java.time.ZonedDateTime

import com.gu.pandomainauth.model.User
import model.editions._
import scalikejdbc._

// Little helpers so we don't contaminate our business model with relational data
case class DbEditionsFront(front: EditionsFront, issue: String, index: Int)
object DbEditionsFront {
  def fromRowOpt(rs: WrappedResultSet): Option[DbEditionsFront] = {
    EditionsFront.fromRowOpt(rs, "fronts_").map { front =>
      DbEditionsFront(front, rs.string("fronts_issue_id"), rs.int("fronts_index"))
    }
  }
}

case class DbEditionsCollection(collection: EditionsCollection, front: String, index: Int)
object DbEditionsCollection {
  def fromRowOpt(rs: WrappedResultSet): Option[DbEditionsCollection] = {
    EditionsCollection.fromRowOpt(rs, "collections_").map { collection =>
      DbEditionsCollection(collection, rs.string("collections_front_id"), rs.int("collections_index"))
    }
  }
}


trait IssueQueries {
  def insertIssue(
      name: String,
      publishDate: ZonedDateTime,
      template: EditionTemplateForDate,
      user: User
  ): String  = DB localTx { implicit session =>
    val issueId = sql"""
          INSERT INTO edition_issues (
            name,
            publish_date,
            created_on,
            created_by,
            created_email
          ) VALUES ($name, $publishDate, now(), ${user.firstName + " " + user.lastName}, ${user.email})
          RETURNING id;
       """.map(_.string("id")).single().apply().get

    template.fronts.zipWithIndex.foreach {
      case (front, index) =>
        val frontId = sql"""
        INSERT INTO fronts (
          issue_id,
          index,
          name,
          is_hidden,
          metadata
        ) VALUES (${issueId}, ${index}, ${front.name}, ${front.hidden}, NULL)
        RETURNING id;
      """.map(_.string("id")).single().apply().get

        front.collections.zipWithIndex.foreach {
          case (collection, index) =>
            sql"""
          INSERT INTO collections (
            front_id,
            index,
            name,
            prefill,
            is_hidden,
            metadata
          ) VALUES ($frontId, $index, ${collection.name}, ${collection.prefill.query}, ${collection.hidden} NULL);
          """.execute().apply()
        }
    }

    issueId
  }

  def getIssue(id: String): Option[EditionsIssue] = DB localTx { implicit session =>
      case class GetIssueRow(
          issue: EditionsIssue,
          front: Option[DbEditionsFront],
          collection: Option[DbEditionsCollection]
      )

      val rows: List[GetIssueRow] = sql"""
      SELECT
        edition_issues.id,
        edition_issues.name,
        edition_issues.publish_date,
        edition_issues.created_on,
        edition_issues.created_by, edition_issues.created_email,

        fronts.id AS fronts_id,
        fronts.issue_id AS fronts_issue_id,
        fronts.index AS fronts_index,
        fronts.name AS fronts_name,
        fronts.is_hidden AS fronts_is_hidden,
        fronts.metadata AS fronts_metadata,
        fronts.updated_on AS fronts_updated_on,
        fronts.updated_by AS fronts_updated_by,
        fronts.updated_email AS fronts_updated_email,

        collections.id AS collections_id,
        collections.front_id AS collections_front_id,
        collections.index AS collections_index,
        collections.name AS collections_name,
        collections.prefill AS collections_prefill,
        collections.is_hidden AS collections_is_hidden,
        collections.metadata AS collections_metadata,
        collections.updated_on AS collections_updated_on,
        collections.updated_by AS collections_updated_by,
        collections.updated_email AS collections_updated_email
      FROM edition_issues
      LEFT JOIN fronts ON (fronts.issue_id = edition_issues.id)
      LEFT JOIN collections ON (collections.front_id = fronts.id)
      WHERE edition_issues.id = $id
      """
        .map { rs =>
            GetIssueRow(EditionsIssue.fromRow(rs), DbEditionsFront.fromRowOpt(rs), DbEditionsCollection.fromRowOpt(rs))
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
            .flatMap(row => row.collection.filter(_.front == front.id))
            .sortBy(_.index)
            .map(_.collection)


          front.copy(collections = collectionsForFront)
        }

    rows.headOption.map(_.issue.copy(fronts = fronts))
  }
}
