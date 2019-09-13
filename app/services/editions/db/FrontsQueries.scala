package services.editions.db

import logging.Logging
import model.editions.{EditionsFront, EditionsFrontMetadata}
import scalikejdbc._
import play.api.libs.json._

trait FrontsQueries extends Logging {
  def updateFrontMetadata(id: String, metadata: EditionsFrontMetadata): Option[EditionsFrontMetadata] = DB localTx { implicit session =>
    sql"""
          UPDATE fronts
          SET metadata = ${metadata.toPGobject}
          WHERE id = $id
      """.execute().apply()

    sql"""
        SELECT metadata FROM fronts WHERE id = $id
      """.map { rs =>
      rs.stringOpt("metadata").map { metadataString =>
        // Throw if we can't parse the metadata to signal to the user that something is broken
        Json.parse(metadataString).validate[EditionsFrontMetadata].get
      }
    }.single().apply().flatten
  }

  def getFrontMetadata(id: String): EditionsFrontMetadata = DB localTx { implicit session =>
    val rawJson =
      sql"""
          SELECT metadata
          from fronts
          WHERE id = $id
      """.map(rs => {
        rs.string("metadata") match {
          case "" => "{}"
          case s:String => s
        }
      }).single().apply().get
    Json.fromJson[EditionsFrontMetadata](Json.parse(rawJson)).get
  }

  def getFrontFromIssueId(issueId: String): Option[EditionsFront] = DB localTx { implicit session =>
    sql"""
      SELECT id
        , issue_id
        , index
        , name
        , is_special
        , is_hidden
        , metadata
        , updated_on
        , updated_by
        , updated_email
      FROM fronts
      WHERE issue_id = $issueId
    """
    .map(result => EditionsFront.fromRow(result))
    .single()
    .apply()
  }

  // TODO: sihil this should really escalate an error if this is attempted when is_special is false but we don't
  // have a clean way of doing that right now.
  def updateFrontHiddenState(id: String, isHidden: Boolean): Option[Boolean] = DB localTx { implicit session =>
    sql"""
         UPDATE fronts
         SET is_hidden = $isHidden
         WHERE id = $id AND is_special = TRUE
       """.execute().apply()

    val newState = sql"""
        SELECT is_hidden, is_special FROM fronts WHERE id = $id
      """.map { rs =>
        (rs.boolean("is_hidden"), rs.boolean("is_special"))
      }.single().apply()

    newState.map { case (isHidden, isSpecial) =>
      if (!isSpecial) logger.warn(s"Tried to update hidden state on front $id which is not a special front")
      isHidden
    }
  }
}
