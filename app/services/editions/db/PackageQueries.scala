package services.editions.db

import scalikejdbc._
import logging.Logging
import model.forms.GetPackagesFilter
import model.packages._
import model.packages.client.CreatePackageRequest
import play.api.libs.json._

import java.time.{OffsetDateTime, Instant}
import java.time.temporal.ChronoUnit
import java.util.UUID

trait PackageQueries extends Logging {

  /** Gets a list of package objects matching the given filters
    * @param packageIds
    *   an optional list of package IDs to return
    * @param lastModified
    *   an optional timestamp for last modified
    * @param strictTimestamp
    *   if true, then only select packages from the given day. If false, then
    *   select anything that has been modified on or before that timestamp
    * @return
    *   a list of matching packages
    */
  def getPackages(
      packageIds: Option[Seq[UUID]],
      lastModified: Option[OffsetDateTime],
      strictTimestamp: Boolean
  ): Seq[Package] =
    DB readOnly { implicit session =>
      {
        val idList = packageIds.getOrElse(Seq.empty).map(_.toString)

        val maybeIdCondition =
          if (idList.nonEmpty) Some(sqls.in(sqls"id", idList)) else None

        val maybeDateCondition = lastModified.map { modifiedSince =>
          if (strictTimestamp) {
            val startOfDay = modifiedSince.truncatedTo(ChronoUnit.DAYS)
            val endOfDay = startOfDay.plusDays(1L)
            sqls"updated_on >= ${startOfDay.toInstant} AND updated_on < ${endOfDay.toInstant}"
          } else {
            sqls"updated_on < ${modifiedSince.toInstant}"
          }
        }

        val whereSql =
          sqls.toAndConditionOpt(maybeIdCondition, maybeDateCondition) match {
            case Some(condition) => sqls"WHERE $condition"
            case None            => sqls""
          }

        fetchPackageMetaSql(
          where = whereSql,
          orderBy = sqls"""ORDER BY created_on DESC LIMIT 200"""
        ).apply()
      }
    }

  def getPackageCards(packageId: UUID): Seq[PackageCardRow] = DB readOnly {
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
      fetchPackageMetaSql(where = sqls"WHERE id = ${p.id}").apply()

    assert(
      updatedPackages.size == 1,
      s"Retrieved ${updatedPackages.size} collections from DB but there should be exactly one. Failing fast."
    )
    updatedPackages.head
  }

  def updatePackage(packageMeta: Package, packageContent: Seq[PackageCardRow]) =
    DB localTx { implicit session =>
      // FOR UPDATE locks the selected rows for the duration of this transaction, allowing us to safely update without a race condition
      val existingContent = fetchPackageContentSql(where =
        sqls"WHERE package_id=${packageMeta.id} FOR UPDATE"
      ).apply()
      val existingMap: Map[String, PackageCardRow] =
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
	  SET state = ${card.state}, page_code = ${card.pageCode}, index = ${card.index}, metadata = ${card.metadataPG}
	  WHERE id = ${card.id}""".update.apply()
      }

      // 5. Insert new cards
      toAdd.foreach { card =>
        sql"""INSERT INTO package_cards (id, package_id, card_type, state, page_code, index, metadata, added_on, added_by, added_email)
	  VALUES (${card.id}, ${packageMeta.id}, ${card.cardType.toString}, ${card.state}, ${card.pageCode}, ${card.index}, ${card.metadataPG}, ${card.addedOn}, ${card.addedBy}, ${card.addedEmail})""".update
          .apply()
      }

      // 6. Update package metadata
      sql"""UPDATE packages
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

  def createPackage(metadata: CreatePackageRequest) = DB localTx {
    implicit session =>
      sql"""INSERT INTO packages (
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
	) VALUES (
 	   ${metadata.id.toLowerCase},
     ${metadata.name},
     ${metadata.isHidden},
     ${metadata.webMetadataPG},
     ${metadata.feastMetadataPG},
     ${metadata.prefill},
     ${Instant.ofEpochMilli(metadata.createdOn)},
     ${metadata.createdBy},
     ${metadata.createdEmail},
     ${Instant.ofEpochMilli(metadata.createdOn)},
     ${metadata.createdBy},
     ${metadata.createdEmail}
	)
     """.execute.apply()
  }

  def updateHidden(packageId: UUID, newValue: Boolean) = DB localTx {
    implicit session =>
      sql"""UPDATE packages SET is_hidden=$newValue WHERE id=${packageId.toString}""".update
        .apply()
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
          createdOn = rs.offsetDateTimeOpt("created_on"),
          createdBy = rs.stringOpt("created_by"),
          createdEmail = rs.stringOpt("created_email"),
          updatedOn = rs.offsetDateTimeOpt("updated_on"),
          updatedBy = rs.stringOpt("updated_by"),
          updatedEmail = rs.stringOpt("updated_email")
        )
      })
      .list
  }

  private def fetchPackageContentSql(
       where: SQLSyntax,
       orderBy: SQLSyntax = sqls""
   ): SQLToList[PackageCardRow, HasExtractor] = {
     val sql =
       sql"""
 			SELECT
    				id,
        			package_id,
 				card_type,
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
         PackageCardRow(
           id = rs.string("id"),
           packageId = rs.string("package_id"),
           cardType = PackageCardType
             .fromString(rs.string("card_type"))
             .getOrElse(
               throw new IllegalArgumentException(
                 s"Invalid card type: ${rs.string("card_type")}"
               )
             ),
           state = rs.string("state"),
           pageCode = rs.string("page_code"),
           index = rs.int("index"),
           metadata = metadata,
            addedOn = rs.offsetDateTime("added_on"),
           addedBy = rs.string("added_by"),
           addedEmail = rs.string("added_email")
         )
       })
       .list
   }
}
