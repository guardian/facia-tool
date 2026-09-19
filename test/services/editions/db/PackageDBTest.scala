package services.editions.db

import com.gu.pandomainauth.model.User
import fixtures.{FaciaDBService, UsesDatabase}
import model.packages.client.CreatePackageRequest
import model.packages.{
  FeastPackageMetadata,
  Package,
  PackageCardRow,
  PackageCardType
}
import org.scalatest.{BeforeAndAfter, FreeSpec, Matchers, OptionValues}
import play.api.libs.json.Json
import play.api.db.evolutions.Evolutions
import scalikejdbc._

import java.time.{OffsetDateTime, ZoneOffset}
import java.util.UUID

class PackageDBTest
    extends FreeSpec
    with Matchers
    with FaciaDBService
    with BeforeAndAfter
    with OptionValues {

  override def beforeAll(): Unit = {
    super.beforeAll()
    Evolutions.applyEvolutions(database)
  }

  before {
    DB localTx { implicit session =>
      sql"DELETE FROM package_cards".update.apply()
      sql"DELETE FROM packages".update.apply()
    }
  }

  private val now: OffsetDateTime =
    OffsetDateTime.of(2024, 11, 14, 9, 30, 0, 0, ZoneOffset.UTC)

  private val user: User =
    User("Billie", "Holiday", "billie.holiday@justice.example.com", None)

  private def makeCreateRequest(
      id: UUID,
      name: String,
      createdOnMillis: Long,
      hidden: Boolean = false,
      packageType: Package.PackageType.Value = Package.PackageType.Feast
  ): CreatePackageRequest =
    CreatePackageRequest(
      id = id,
      name = name,
      isHidden = hidden,
      packageType = packageType,
      metadata = Some(FeastPackageMetadata(bodyText = Some("text goes here"))),
      createdOn = createdOnMillis,
      createdBy = s"${user.firstName} ${user.lastName}",
      createdEmail = user.email
    )

  private def insertPackage(
      id: UUID,
      name: String,
      createdOnMillis: Long,
      hidden: Boolean = false
  ): Unit = {
    faciaDB.createPackage(
      makeCreateRequest(id, name, createdOnMillis, hidden)
    )
  }

  private def insertCard(card: PackageCardRow): Unit = {
    DB localTx { implicit session =>
      sql"""INSERT INTO package_cards (
            package_id,
            card_type,
            page_code,
            index,
            metadata,
            added_on,
            added_by,
            added_email
          ) VALUES (
            ${card.packageId},
            ${card.cardType.toString},
            ${card.pageCode},
            ${card.index},
            ${card.metadataPG},
            ${card.addedOn},
            ${card.addedBy},
            ${card.addedEmail}
          )""".update.apply()
    }
  }

  "should create and fetch a package by id" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    val createdOn = now.toInstant.toEpochMilli

    insertPackage(packageId, "Weekend recipes", createdOn)

    val loaded =
      faciaDB.getPackages(
        Some(Seq(packageId)),
        None,
        thisDayOnly = false
      )

    loaded should have size 1
    loaded.head.id shouldBe packageId
    loaded.head.name shouldBe "Weekend recipes"
    loaded.head.isHidden shouldBe false
    loaded.head.packageType shouldBe Package.PackageType.Feast
    loaded.head.metadata shouldBe Some(
      FeastPackageMetadata(bodyText = Some("text goes here"))
    )
    loaded.head.createdEmail shouldBe Some(user.email)
  }

  "should filter packages by updated timestamp" taggedAs UsesDatabase in {
    val olderPackageId = UUID.randomUUID()
    val newerPackageId = UUID.randomUUID()

    val olderMillis = now.minusDays(2).toInstant.toEpochMilli
    val newerMillis = now.plusDays(2).toInstant.toEpochMilli

    insertPackage(olderPackageId, "Older", olderMillis)
    insertPackage(newerPackageId, "Newer", newerMillis)

    val filtered = faciaDB.getPackages(
      None,
      Some(now),
      thisDayOnly = false
    )

    filtered.map(_.id) should contain(olderPackageId)
    filtered.map(_.id) should not contain newerPackageId
  }

  "should filter packages by day when thisDayOnly is enabled" taggedAs UsesDatabase in {
    val dayStart = now.withHour(0).withMinute(0).withSecond(0).withNano(0)

    val inDayPackage = UUID.randomUUID()
    val previousDayPackage = UUID.randomUUID()

    insertPackage(
      inDayPackage,
      "In day",
      dayStart.plusHours(6).toInstant.toEpochMilli
    )
    insertPackage(
      previousDayPackage,
      "Previous day",
      dayStart.minusDays(1).plusHours(22).toInstant.toEpochMilli
    )

    val strict = faciaDB.getPackages(
      None,
      Some(dayStart),
      thisDayOnly = true
    )

    strict.map(_.id) should contain(inDayPackage)
    strict.map(_.id) should not contain previousDayPackage
  }

  "should update package name" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    val createdOn = now.toInstant.toEpochMilli
    insertPackage(packageId, "Original name", createdOn)

    val count = faciaDB.updatePackageName(
      packageId,
      "Renamed package",
      userName = "New Name",
      userEmail = "new.name@guardian.co.uk"
    )

    count shouldEqual 1

    val updated = faciaDB.getPackages(Some(Seq(packageId))).head
    updated.name shouldBe "Renamed package"
    updated.updatedBy shouldBe Some("New Name")
    updated.updatedEmail shouldBe Some("new.name@guardian.co.uk")
  }

  "should update hidden state" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    insertPackage(
      packageId,
      "Hidden toggle",
      now.toInstant.toEpochMilli
    )

    faciaDB.updateHidden(
      packageId,
      newValue = true,
      userName = "New name",
      userEmail = "new.name@guardian.co.uk"
    )

    val loaded = faciaDB.getPackages(
      Some(Seq(packageId)),
      None
    )
    loaded should have size 1
    loaded.head.isHidden shouldBe true
    loaded.head.updatedBy shouldEqual Some("New name")
    loaded.head.updatedEmail shouldEqual Some("new.name@guardian.co.uk")
  }

  "should update package metadata and package cards" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    insertPackage(packageId, "Starter package", now.toInstant.toEpochMilli)

    val existingPageCode = "recipe-original"
    val removablePageCode = "chef-remove"

    insertCard(
      PackageCardRow(
        packageId = packageId.toString,
        cardType = PackageCardType.Recipe,
        pageCode = existingPageCode,
        index = 0,
        metadata = Some(Json.obj("origin" -> "existing")),
        addedOn = now.minusDays(1),
        addedBy = "Alice Example",
        addedEmail = "alice@example.com"
      )
    )

    insertCard(
      PackageCardRow(
        packageId = packageId.toString,
        cardType = PackageCardType.Chef,
        pageCode = removablePageCode,
        index = 1,
        metadata = Some(Json.obj("origin" -> "remove")),
        addedOn = now.minusDays(1),
        addedBy = "Alice Example",
        addedEmail = "alice@example.com"
      )
    )

    val updatedMetadata = Package(
      id = packageId,
      name = "Updated package",
      isHidden = true,
      packageType = Package.PackageType.Feast,
      metadata = Some(FeastPackageMetadata(bodyText = Some("text goes here"))),
      createdOn = Some(now),
      createdBy = Some("Billie Holiday"),
      createdEmail = Some("billie.holiday@justice.example.com"),
      updatedOn = Some(now.plusHours(1)),
      updatedBy = Some("Package Editor"),
      updatedEmail = Some("package.editor@guardian.co.uk")
    )

    val updatedExistingCard = PackageCardRow(
      packageId = packageId.toString,
      cardType = PackageCardType.Recipe,
      pageCode = "recipe-updated",
      index = 2,
      metadata = Some(Json.obj("origin" -> "updated")),
      addedOn = now.minusDays(1),
      addedBy = "Alice Example",
      addedEmail = "alice@example.com"
    )

    val newCard = PackageCardRow(
      packageId = packageId.toString,
      cardType = PackageCardType.Subcollection,
      pageCode = "subcollection-new",
      index = 0,
      metadata = Some(Json.obj("origin" -> "new")),
      addedOn = now,
      addedBy = "Bob Editor",
      addedEmail = "bob.editor@guardian.co.uk"
    )

    faciaDB.updatePackage(updatedMetadata, Seq(updatedExistingCard, newCard))

    val loadedPackage =
      faciaDB
        .getPackages(Some(Seq(packageId)), None, thisDayOnly = false)
        .head
    loadedPackage.name shouldBe "Updated package"
    loadedPackage.isHidden shouldBe true
    loadedPackage.packageType shouldBe Package.PackageType.Feast
    loadedPackage.metadata shouldBe Some(
      FeastPackageMetadata(bodyText = Some("text goes here"))
    )

    val loadedCards = faciaDB.getPackageCards(packageId)
    loadedCards.map(_.pageCode) should contain("recipe-updated")
    loadedCards.map(_.pageCode) should contain(newCard.pageCode)
    loadedCards.map(_.pageCode) should not contain (removablePageCode)

    loadedCards.map(_.index) shouldBe loadedCards.map(_.index).sorted
    loadedCards
      .find(_.pageCode == "recipe-updated")
      .value
      .pageCode shouldBe "recipe-updated"
    loadedCards
      .find(_.pageCode == newCard.pageCode)
      .value
      .cardType shouldBe PackageCardType.Subcollection

    loadedCards.length shouldEqual 2
  }

  "should handle invalid package_type gracefully" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    val createdOn = OffsetDateTime.now()

    DB localTx { implicit session =>
      sql"""INSERT INTO packages (
            id,
            name,
            is_hidden,
            package_type,
            metadata,
            created_on,
            created_by,
            created_email
          ) VALUES (
            ${packageId.toString},
            'Invalid Type Package',
            false,
            'UnknownType',
            null,
            ${createdOn},
            'Test Editor',
            'test@example.com'
          )""".update.apply()
    }

    val loaded =
      faciaDB.getPackages(
        Some(Seq(packageId)),
        None,
        thisDayOnly = false
      )

    loaded should have size 1
    loaded.head.id shouldBe packageId
    loaded.head.name shouldBe "Invalid Type Package"
    loaded.head.packageType shouldBe Package.PackageType.Invalid
    loaded.head.metadata shouldBe None
  }

  "should handle invalid metadata JSON gracefully" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    val createdOn = OffsetDateTime.now()

    DB localTx { implicit session =>
      sql"""INSERT INTO packages (
            id,
            name,
            is_hidden,
            package_type,
            metadata,
            created_on,
            created_by,
            created_email
          ) VALUES (
            ${packageId.toString},
            'Invalid Metadata Package',
            false,
            'Feast',
            '{"invalid": "json that does not match schema"}'::jsonb,
            ${createdOn},
            'Test Editor',
            'test@example.com'
          )""".update.apply()
    }

    val loaded =
      faciaDB.getPackages(
        Some(Seq(packageId)),
        None,
        thisDayOnly = false
      )

    loaded should have size 1
    loaded.head.id shouldBe packageId
    loaded.head.name shouldBe "Invalid Metadata Package"
    loaded.head.packageType shouldBe Package.PackageType.Feast
    loaded.head.metadata shouldBe None
  }
}
