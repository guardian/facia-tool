package services.editions.db

import scalikejdbc._
import logging.Logging
import model.editions.EditionsFeastCollectionMetadata
import model.forms.GetPackagesFilter
import model.packages._
import model.packages.client.CreatePackageRequest
import play.api.libs.json._

import java.time.{Instant, OffsetDateTime}
import java.time.temporal.ChronoUnit
import java.util.UUID
import scala.util.Try

trait PackageQueries extends MetadataHelpers with Logging {

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

  /** Updates the "name" field of the given package, and audits the update
    * @param packageId
    *   package ID to update
    * @param newName
    *   new name to set
    * @param userName
    *   name of the user performing the operation
    * @param userEmail
    *   email of the user performing the operation
    * @return
    *   the updated Package object
    */
  def updatePackageName(
      packageId: UUID,
      newName: String,
      userName: String,
      userEmail: String
  ) = DB localTx { implicit session =>
    val lastUpdated = FaciaDB.truncateDateTime(OffsetDateTime.now())
    sql"""UPDATE packages
          SET
			 name=$newName,
    		 updated_on=$lastUpdated,
      	     updated_by=$userName,
             updated_email=$userEmail
		  WHERE id=$packageId""".execute.apply()
    val updatedPackages =
      fetchPackageMetaSql(where = sqls"WHERE id = $packageId").apply()

    assert(
      updatedPackages.size == 1,
      s"Retrieved ${updatedPackages.size} collections from DB but there should be exactly one. Failing fast."
    )
    updatedPackages.head
  }

  /** Inserts a card into the given package. If a card with the same page_code
    * already exists, throws a PSQLException indicating a conflict. The
    * controller catches this with `psqlErrorHandler` and returns a 410 Conflict
    * to the client
    * @param packageId
    *   package ID to update
    * @param card
    *   PackageCardRow record representing the information to store
    * @return
    *   count of affected rows
    */
  def insertCard(packageId: UUID, card: PackageCardRow) = DB localTx {
    implicit session =>
      sql"""INSERT INTO package_cards (package_id, card_type, page_code, index, metadata, added_on, added_by, added_email) VALUES (${packageId.toString}, ${card.cardType.toString}, ${card.pageCode}, ${card.index}, ${card.metadataPG}, ${card.addedOn}, ${card.addedBy}, ${card.addedEmail})""".update
        .apply()
  }

  /** Removes the card with the given pageCode from the given package. Since the
    * primary key is (packageId, pageCode) this is sufficient to uniquely
    * identify a package
    * @param packageId
    *   package ID to update
    * @param pageCode
    *   pageCode of the card to remove
    * @return
    *   count of affected rows
    */
  def removeCard(packageId: UUID, pageCode: String) = DB localTx {
    implicit session =>
      sql"""DELETE FROM package_cards WHERE package_id=${packageId.toString} AND page_code=${pageCode}""".update
        .apply()
  }

  /** Updates the metadata field of the package. This can be either
    * `feast_metadata` or `web_metadata`; depending on the type of the `newMeta`
    * argument the right field is selected.
    * @param packageId
    *   ID of the package to update
    * @param newMeta
    *   PackageMetadata object to write
    * @param userName
    *   name of the user performing the update
    * @param userEmail
    *   email of the user performing the update
    * @return
    *   count of affected rows
    */
  def updatePackageMeta(
      packageId: UUID,
      newMeta: PackageMetadata,
      userName: String,
      userEmail: String
  ) = {
    val metaPg = toPGobject(PackageMetadata.format.writes(newMeta))
    val fieldName = newMeta match {
      case _: FeastPackageMetadata => "feast_metadata"
      case _: WebPackageMetadata   => "web_metadata"
    }
    val nowTime = Instant.now().toEpochMilli
    DB localTx { implicit session =>
      sql"""UPDATE packages SET
     	$fieldName = $metaPg,
      	updated_on = $nowTime,
        updated_by = $userName,
        updated_email = $userEmail
    	WHERE id=${packageId.toString}""".update
        .apply()
    }
  }

  /** Writes an entire package in one go, synchronising the database state of
    * the package cards transactionally
    * @param packageMeta
    *   Package object to write
    * @param packageContent
    *   set of cards to belong to the package. Any cards not in this list will
    *   be removed.
    * @return
    *   count of affected packages
    */
  def updatePackage(packageMeta: Package, packageContent: Seq[PackageCardRow]) =
    DB localTx { implicit session =>
      // FOR UPDATE locks the selected rows for the duration of this transaction, allowing us to safely update without a race condition
      val existingContent = fetchPackageContentSql(where =
        sqls"WHERE package_id=${packageMeta.id} FOR UPDATE"
      ).apply()
      val existingMap: Map[String, PackageCardRow] =
        existingContent
          .map(c => c.pageCode -> c)
          .toMap // the PK is (package_id, page_code); since package_id is constant, pageCode is a unique identifer

      // 2. Separate into remove, add, and update by ID
      val incomingIds = packageContent.map(_.pageCode).toSet
      val idsToRemove = existingMap.keySet -- incomingIds

      val (toUpdate, toAdd) =
        packageContent.partition(card => existingMap.contains(card.pageCode))

      // 3. Delete removed cards safely
      if (idsToRemove.nonEmpty) {
        sql"DELETE FROM package_cards WHERE id IN (${idsToRemove.toSeq})".update
          .apply()
      }

      // 4. Update modified cards in place
      toUpdate.foreach { card =>
        sql"""UPDATE package_cards
	  SET index = ${card.index}, metadata = ${card.metadataPG}
	  WHERE package_id = ${packageMeta.id} AND pageCode = ${card.pageCode}"""".update
          .apply()
      }

      // 5. Insert new cards
      toAdd.foreach { card =>
        sql"""INSERT INTO package_cards (package_id, card_type, page_code, index, metadata, added_on, added_by, added_email)
	  VALUES (${packageMeta.id}, ${card.cardType.toString}, ${card.pageCode}, ${card.index}, ${card.metadataPG}, ${card.addedOn}, ${card.addedBy}, ${card.addedEmail})""".update
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

  /** Creates a new, empty, package
    * @param metadata
    *   CreatePackageRequest representing the package to create
    * @return
    *   number of rows set
    */
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
     """.update.apply()
  }

  /** Updates the 'hidden' flag on a package
    * @param packageId
    *   ID of the package to update
    * @param newValue
    *   new value of the 'hidden' flag
    * @param userName
    *   name of the user performing the update
    * @param userEmail
    *   email of the user performing the update
    * @return
    */
  def updateHidden(
      packageId: UUID,
      newValue: Boolean,
      userName: String,
      userEmail: String
  ) = DB localTx { implicit session =>
    val now = Instant.now().toEpochMilli
    sql"""UPDATE packages SET
    	 is_hidden=$newValue ,
		 updated_at=$now,
		 updated_by=$userName,
		 updated_email=$userEmail
       WHERE id=${packageId.toString}""".update
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
        val feastMeta =
          rs.stringOpt("feast_metadata").flatMap(getFeastCollectionMetadata)
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
          packageId = rs.string("package_id"),
          cardType = PackageCardType
            .fromString(rs.string("card_type"))
            .getOrElse(
              throw new IllegalArgumentException(
                s"Invalid card type: ${rs.string("card_type")}"
              )
            ),
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
