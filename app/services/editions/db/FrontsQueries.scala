package services.editions.db

import model.editions.EditionsFrontMetadata
import play.api.libs.json.Json
import scalikejdbc._

trait FrontsQueries {
  def updateFrontMetadata(id: String, metadata: EditionsFrontMetadata) = DB localTx { implicit session =>
    sql"""
          UPDATE fronts
          SET metadata = ${Json.toJson(metadata).toString}::JSONB
          WHERE id = $id
      """.execute().apply()
  }
}
