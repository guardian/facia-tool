package services.editions.db

import scalikejdbc._
import logging.Logging
import model.forms.GetPackagesFilter
import model.packages._
import play.api.libs.json._

import java.time.OffsetDateTime
import java.util.UUID

trait PackageQueries extends Logging {

  /** Gets a list of package objects matching the given filters
    * @param filters
    *   filters to match
    * @return
    *   a list of matching packages
    */
  def getPackages(filters: List[GetPackagesFilter]): Seq[Package] =
    DB readOnly { implicit session =>
      {
        val idList =
          filters.map(_.id).collect({ case Some(id) => id }).map(_.toString)

        val timestampF = filters
          .filter(_.lastModified.isDefined)
          .sortBy(_.lastModified.get)
          .headOption

        if (idList.isEmpty && timestampF.isEmpty) {
          // No filters present
          Seq.empty
        } else {
          var whereSql = sqls"""WHERE """

          if (idList.nonEmpty) {
            whereSql += sqls"""id IN (${idList.mkString(",")})"""
          }
          // TODO - date filtering

          fetchPackageMetaSql(
            where = whereSql,
            orderBy = sqls"""ORDER BY created_on DESC"""
          ).apply()
        }
      }
    }

  def getPackageCards(packageId: UUID): Seq[PackageCard] = DB readOnly {
    implicit session =>
      fetchPackageContentSql(
        where = sqls"""WHERE package_id=${packageId.toString}""",
        orderBy = sqls"""ORDER BY index ASC"""
      ).apply()
  }

  def updatePackageName(p: Package) = DB localTx { implicit session =>
    val lastUpdated = FaciaDB.truncateDateTime(OffsetDateTime.now())
    sql"""UPDATE packages
          SET
			 name=${p.name},
    		 updated_on=${lastUpdated},
      	     updated_by=${p.updatedBy},
             updated_email=${p.updatedEmail}
		  WHERE id=${p.id}""".execute.apply()
    val updatedPackages =
      fetchPackageMetaSql(where = sqls"id = ${p.id}").apply()

    assert(
      updatedPackages.size == 1,
      s"Retrieved ${updatedPackages.size} collections from DB but there should be exactly one. Failing fast."
    )
    updatedPackages.head
  }

  def updatePackage(packageMeta: Package, packageContent: Seq[PackageCard]) =
    DB localTx { implicit session =>
      // FOR UPDATE locks the selected rows for the duration of this transaction, allowing us to safely update without a race condition
      val existingContent = fetchPackageContentSql(where =
        sqls"WHERE package_id=${packageMeta.id} FOR UPDATE"
      ).apply()
      val existingMap: Map[String, PackageCard] =
        existingContent.map(c => c.id -> c).toMap

      // 2. Separate into remove, add, and update by ID
      val incomingIds = packageContent.map(_.id).toSet
      val idsToRemove = existingMap.keySet -- incomingIds

      val (toUpdate, toAdd) =
        packageContent.partition(card => existingMap.contains(card.id))

      // 3. Delete removed cards safely
      if (idsToRemove.nonEmpty) {
        sql"DELETE FROM package_cards WHERE id IN (${idsToRemove.toSeq})".update
          .apply()
      }

      // 4. Update modified cards in place
      toUpdate.foreach { card =>
        sql"""UPDATE package_cards
	  SET state = ${card.state}, page_code = ${card.pageCode}, index = ${card.index}, metadata = ${card.metadata}
	  WHERE id = ${card.id}""".update.apply()
      }

      // 5. Insert new cards
      toAdd.foreach { card =>
        sql"""INSERT INTO package_cards (package_id, state, page_code, index, metadata, added_on, added_by, added_email)
	  VALUES (${packageMeta.id}, ${card.state}, ${card.pageCode}, ${card.index}, ${card.metadata}, ${card.addedOn}, ${card.addedBy}, ${card.addedEmail})""".update
          .apply()
      }

      // 6. Update package metadata
      sql"""UPDATE package
        SET
   			name=${packageMeta.name},
   			is_hidden=${packageMeta.isHidden},
   			web_metadata=${packageMeta.webMetadataPG},
   			feast_metadata=${packageMeta.feastMetadataPG},
   			prefill=${packageMeta.prefill},
   			updated_on=${packageMeta.updatedOn},
   			updated_by=${packageMeta.updatedBy},
   			updated_email=${packageMeta.updatedEmail}
   		WHERE id=${packageMeta.id}
     """.update.apply()
    }

  private def fetchPackageMetaSql(
      where: SQLSyntax,
      orderBy: SQLSyntax = sqls""
  ): SQLToList[Package, HasExtractor] = {
    val sql = sql"""
    SELECT
        id,
        name,
        is_hidden,
        web_metadata,
        feast_metadata,
        prefill,
        created_on,
        created_by,
        created_email,
        updated_on,
        updated_by,
        updated_email
    FROM packages
    $where
    $orderBy
    """

    sql
      .map(rs => {
        val feastMeta = rs.stringOpt("feast_metadata").map(Json.parse)
        val webMeta = rs.stringOpt("web_metadata").map(Json.parse)
        Package(
          id = rs.string("id"),
          name = rs.string("name"),
          isHidden = rs.boolean("is_hidden"),
          webMetadata = webMeta,
          feastMetadata = feastMeta,
          prefill = rs.stringOpt("prefill"),
          createdOn = rs.timestampOpt("created_on").map(_.getTime),
          createdBy = rs.stringOpt("created_by"),
          createdEmail = rs.stringOpt("created_email"),
          updatedOn = rs.timestampOpt("updated_on").map(_.getTime),
          updatedBy = rs.stringOpt("updated_by"),
          updatedEmail = rs.stringOpt("updated_email")
        )
      })
      .list
  }

  private def fetchPackageContentSql(
      where: SQLSyntax,
      orderBy: SQLSyntax = sqls""
  ): SQLToList[PackageCard, HasExtractor] = {
    val sql =
      sql"""
			SELECT
   				id,
       			package_id,
				state,
				page_code,
    			index,
    			metadata,
       			added_on,
          		added_by,
            	added_email
			FROM package_cards
   			$where
      		$orderBy
			"""
    sql
      .map(rs => {
        val metadata = rs.stringOpt("metadata").map(Json.parse)
        PackageCard(
          id = rs.string("id"),
          packageId = rs.string("package_id"),
          state = rs.string("state"),
          pageCode = rs.string("page_code"),
          index = rs.int("index"),
          metadata = metadata,
          addedOn = rs.timestamp("added_on").getTime,
          addedBy = rs.string("added_by"),
          addedEmail = rs.string("added_email")
        )
      })
      .list
  }
}
