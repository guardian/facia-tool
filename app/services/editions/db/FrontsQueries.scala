package services.editions.db

import model.editions.{EditionsFrontMetadata, FrontPresentation}
import scalikejdbc._
import play.api.libs.json._

trait FrontsQueries {
  def updateFrontMetadata(id: String, metadata: EditionsFrontMetadata) = DB localTx { implicit session =>
    sql"""
          UPDATE fronts
          SET metadata = ${metadata.toPGobject()}
          WHERE id = $id
      """.execute().apply()
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

  def mergeFrontMetadata(id: String, metadata: EditionsFrontMetadata) = DB localTx { implicit session =>
    val original = getFrontMetadata(id)
    val mergedMetadata = mergeMetadatas(metadata, original)
    updateFrontMetadata(id, mergedMetadata)

  }

  def mergeMetadatas(additionalMetadata: EditionsFrontMetadata, originalMetadata: EditionsFrontMetadata) = {
    Json.fromJson[EditionsFrontMetadata](Json.toJson(originalMetadata).as[JsObject] ++ Json.toJson(additionalMetadata).as[JsObject]).get
  }

}
