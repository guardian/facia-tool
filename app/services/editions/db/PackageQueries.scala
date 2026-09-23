package services.editions.db

import scalikejdbc._
import logging.Logging
import model.packages.Package.PackageType
import model.packages._
import model.packages.client.CreatePackageRequest
import play.api.libs.json._
import services.editions.db.PackageQueries.OrderingField

import java.sql.Timestamp
import java.time.{Instant, OffsetDateTime}
import java.time.temporal.ChronoUnit
import java.util.{NoSuchElementException, UUID}
import scala.util.Try

trait PackageQueries extends MetadataHelpers with Logging {

  /** Gets a list of package objects matching the given filters
    * @param packageIds
    *   an optional list of package IDs to return
    * @param lastModified
    *   an optional timestamp for last modified
    * @param thisDayOnly
    *   if true, then only select packages from the given day. If false, then
    *   select anything that has been modified on or before that timestamp
    * @return
    *   a list of matching packages
    */
  def getPackages(
      packageIds: Option[Seq[UUID]],
      lastModified: Option[OffsetDateTime] = None,
      thisDayOnly: Boolean = false,
      searchByTitle: Option[String] = None,
      typeFilter: Option[PackageType] = None,
      orderBy: OrderingField = PackageQueries.CreatedOn,
      limit: Int = 200
  ): Seq[Package] =
    DB readOnly { implicit session =>
      {
        val idList = packageIds.getOrElse(Seq.empty).map(_.toString)

        val maybeIdCondition =
          if (idList.nonEmpty) Some(sqls.in(sqls"id", idList)) else None

        val maybeDateCondition = lastModified.map { modifiedSince =>
          if (thisDayOnly) {
            val startOfDay = modifiedSince.truncatedTo(ChronoUnit.DAYS)
            val endOfDay = startOfDay.plusDays(1L)
            sqls"updated_on >= ${startOfDay.toInstant} AND updated_on < ${endOfDay.toInstant}"
          } else {
            sqls"updated_on <= ${modifiedSince.toInstant}"
          }
        }

        val maybeTypeCondition = typeFilter.map { t =>
          sqls"package_type = ${t.value}"
        }

        val maybeTitleCondition = searchByTitle.map { titleSearch =>
          val param = s"%$titleSearch%"
          sqls"name ilike $param"
        }

        val whereSql =
          sqls.toAndConditionOpt(
            maybeIdCondition,
            maybeDateCondition,
            maybeTypeCondition,
            maybeTitleCondition
          ) match {
            case Some(condition) => sqls"WHERE $condition"
            case None            => sqls""
          }

        fetchPackageMetaSql(
          where = whereSql,
          orderBy = sqls"""ORDER BY ${orderBy.toSql} DESC LIMIT $limit"""
        ).apply().collect({ case Some(pkg) => pkg })
      }
    }

  def getPackageById(packageId: UUID): Option[Package] =
    getPackages(Some(Seq(packageId)), None).headOption

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
		  WHERE id=${packageId.toString}""".update.apply()
  }

  def updatePackageMeta(
      packageId: UUID,
      newMeta: PackageMetadata,
      userName: String,
      userEmail: String
  ) = DB localTx { implicit session =>
    val lastUpdated = FaciaDB.truncateDateTime(OffsetDateTime.now())
    val packageTypeStr =
      sql"SELECT package_type FROM packages WHERE id=${packageId.toString} FOR UPDATE"
        .map { rs => rs.get[String](1) }
        .single
        .apply()

    try {
      val newMetaPG = toPGobject(newMeta.toJson)
      packageTypeStr.flatMap(Package.PackageType.withName) match {
        case None =>
          Right(0)
        case Some(PackageType.Feast) =>
          if (newMeta.isInstanceOf[FeastPackageMetadata]) {
            Right(sql"""UPDATE packages
     			SET
     				metadata=$newMetaPG,
     				updated_on=$lastUpdated,
     				updated_by=$userName,
     				updated_email=$userEmail
     			WHERE id=${packageId.toString}""".update.apply())
          } else {
            Left("Selected package does not support this metadata")
          }
        case Some(PackageType.Story) =>
          if (newMeta.isInstanceOf[StoryPackageMetadata]) {
            Right(sql"""UPDATE packages
     			SET
     				metadata=$newMetaPG,
     				updated_on=$lastUpdated,
     				updated_by=$userName,
     				updated_email=$userEmail
     			WHERE id=${packageId.toString}""".update.apply())
          } else {
            Left("Selected package does not support this metadata")
          }
      }
    } catch {
      case _: NoSuchElementException => Right(0)
    }
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
        sqls"WHERE package_id=${packageMeta.id.toString} FOR UPDATE"
      ).apply()
      val existingMap: Map[String, PackageCardRow] =
        existingContent
          .map(c => c.pageCode -> c)
          .toMap // the PK is (package_id, page_code); since package_id is constant, pageCode is a unique identifier

      // 2. Separate into remove, add, and update by ID
      val incomingIds = packageContent.map(_.pageCode).toSet
      val idsToRemove = existingMap.keySet -- incomingIds

      val (toUpdate, toAdd) =
        packageContent.partition(card => existingMap.contains(card.pageCode))

      // 3. Delete removed cards safely
      if (idsToRemove.nonEmpty) {
        sql"DELETE FROM package_cards WHERE page_code IN (${idsToRemove.toSeq}) AND package_id=${packageMeta.id.toString}".update
          .apply()
      }

      // 4. Update modified cards in place
      toUpdate.foreach { card =>
        sql"""UPDATE package_cards
	  SET index = ${card.index}, metadata = ${card.metadataPG}
	  WHERE package_id = ${packageMeta.id.toString} AND page_code = ${card.pageCode}""".update
          .apply()
      }

      // 5. Insert new cards
      toAdd.foreach { card =>
        sql"""INSERT INTO package_cards (package_id, card_type, page_code, index, metadata, added_on, added_by, added_email)
	  VALUES (${packageMeta.id.toString}, ${card.cardType.toString}, ${card.pageCode}, ${card.index}, ${card.metadataPG}, ${card.addedOn}, ${card.addedBy}, ${card.addedEmail})""".update
          .apply()
      }

      // 6. Update package metadata
      sql"""UPDATE packages
        SET
   			name=${packageMeta.name},
   			is_hidden=${packageMeta.isHidden},
   			metadata=${packageMeta.metadataPG},
      		updated_on=${packageMeta.updatedOn},
   			updated_by=${packageMeta.updatedBy},
   			updated_email=${packageMeta.updatedEmail}
   		WHERE id=${packageMeta.id.toString}
     """.update.apply()
    }

  /** Creates a new, empty, package
    * @param metadata
    *   CreatePackageRequest representing the package to create
    * @return
    *   number of rows set
    */
  def createPackage(
      metadata: CreatePackageRequest,
      createdOn: OffsetDateTime,
      createdBy: String,
      createdEmail: String
  ) = DB localTx { implicit session =>
    sql"""INSERT INTO packages (
        id,
        name,
        package_type,
        is_hidden,
        metadata,
        created_on,
        created_by,
        created_email,
        updated_on,
        updated_by,
        updated_email
	) VALUES (
 	   ${metadata.id.toString},
     ${metadata.name},
     ${metadata.packageType.toString},
     ${metadata.isHidden},
     ${metadata.metadataPG},
     ${createdOn},
     ${createdBy},
     ${createdEmail},
     ${createdOn},
     ${createdBy},
     ${createdEmail}
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
    val now = Instant.now()
    val nowTS = Timestamp.from(now)
    sql"""UPDATE packages SET
    	 is_hidden=$newValue ,
		 updated_on=$nowTS,
		 updated_by=$userName,
		 updated_email=$userEmail
       WHERE id=${packageId.toString}""".update
      .apply()
  }

  private def fetchPackageMetaSql(
      where: SQLSyntax,
      orderBy: SQLSyntax = sqls""
  ): SQLToList[Option[Package], HasExtractor] = {
    val sql = sql"""
    SELECT
        id,
        name,
        is_hidden,
        metadata,
        package_type,
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

    sql.map(Package.fromRow).list
  }

  private def fetchPackageContentSql(
      where: SQLSyntax,
      orderBy: SQLSyntax = sqls""
  ): SQLToList[PackageCardRow, HasExtractor] = {
    val sql =
      sql"""
 			SELECT
        		package_id,
 				card_type,
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
              PackageCardType.Invalid
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

object PackageQueries {
  sealed trait OrderingField {
    def toSql: SQLSyntax
  }

  case object CreatedOn extends OrderingField {
    override def toString = "created_on"
    override def toSql = sqls"created_on"
  }
  case object UpdatedOn extends OrderingField {
    override def toString = "updated_on"
    override def toSql = sqls"updated_on"
  }
  case object Title extends OrderingField {
    override def toString = "name"
    override def toSql = sqls"name"
  }

  object OrderingField {
    def fromString(str: String): Option[OrderingField] = str match {
      case "created" | "created_on" => Some(CreatedOn)
      case "updated" | "updated_on" => Some(UpdatedOn)
      case "name"                   => Some(Title)
      case _                        => None
    }
  }
}
