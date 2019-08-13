package services.editions.db

import model.editions.EditionsFrontMetadata
import scalikejdbc._
import play.api.libs.json._

trait FrontsQueries {
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
}
