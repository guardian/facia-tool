package services.editions

import java.time.ZonedDateTime

import com.gu.pandomainauth.model.User
import model.EditionTemplateForDate
import scalikejdbc._

trait IssueQueries {
  def insertIssue(name: String, publishDate: ZonedDateTime, template: EditionTemplateForDate, user: User) = DB localTx { implicit session =>
    val issueId = sql"""
          INSERT INTO edition_issues (name, publish_date, created_on, created_by, created_email)
          VALUES ($name, $publishDate, now(), ${user.firstName + user.lastName}, ${user.email}) RETURNING id ;
       """.map(_.string("id")).single().apply().get

    template.fronts.foreach {  front =>
      val frontId = sql"""
        INSERT INTO fronts (
          issue_id,
          name,
          is_hidden,
          metadata
        ) VALUES (${issueId}, ${front.name}, ${front.hidden}, NULL)
        RETURNING id;
      """.map(_.string("id")).single().apply().get

      front.collections.foreach { collection =>
        sql"""
          INSERT INTO collections (
            front_id,
            name,
            prefill,
            metadata
          ) VALUES ($frontId, ${collection.name}, ${collection.prefill.query}, NULL);
          """.execute().apply()
      }
    }
  }

  //def getIssue(start: ZonedDateTime, end: ZonedDateTime) = DB localTx { implicit session =>
  //  sql"""
  //    SELECT
  //      edition_issues.id,
  //      edition_issues.name,
  //      edition_issues.publish_date,
  //      edition_issues.created_on,
  //      edition_issues.created_by,
  //      edition_issues.created_email
  //
  //      fronts.id,
  //      fronts.issue_id,
  //      fronts.name,
  //      fronts.is_hidden,
  //      fronts.metadata,
  //      fronts.updated_on,
  //      fronts.updated_by,
  //      fronts.updated_email,
  //
  //      collections.id,
  //      collections.front_id,
  //      collections.name,
  //      collections.prefill,
  //      collections.metadata,
  //      collections.updated_on,
  //      collections.updated_by,
  //      collections.updated_email
  //    FROM edition_issues
  //    LEFT JOIN fronts ON (fronts.issue_id = edition_issues.id)
  //    LEFT JOIN collections ON (collections.front_id = fronts.id)
  //    WHERE publish_date > $start AND publish_date < $end
  //    """.map(Issue.fromRow).list().apply()
  //}
}
