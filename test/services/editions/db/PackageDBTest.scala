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
      hidden: Boolean = false
  ): CreatePackageRequest =
    CreatePackageRequest(
      id = id.toString,
      name = name,
      isHidden = hidden,
      webMetadata = Some(Json.obj("source" -> "test")),
      feastMetadata =
        Some(FeastPackageMetadata(bodyText = Some("text goes here"))),
      prefill = Some("recipes"),
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
    editionsDB.createPackage(
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
      editionsDB.getPackages(
        Some(Seq(packageId)),
        None,
        strictTimestamp = false
      )

    loaded should have size 1
    loaded.head.id shouldBe packageId.toString
    loaded.head.name shouldBe "Weekend recipes"
    loaded.head.isHidden shouldBe false
    loaded.head.prefill shouldBe Some("recipes")
    loaded.head.createdEmail shouldBe Some(user.email)
  }

  "should filter packages by updated timestamp" taggedAs UsesDatabase in {
    val olderPackageId = UUID.randomUUID()
    val newerPackageId = UUID.randomUUID()

    val olderMillis = now.minusDays(2).toInstant.toEpochMilli
    val newerMillis = now.plusDays(2).toInstant.toEpochMilli

    insertPackage(olderPackageId, "Older", olderMillis)
    insertPackage(newerPackageId, "Newer", newerMillis)

    val filtered = editionsDB.getPackages(
      None,
      Some(now),
      strictTimestamp = false
    )

    filtered.map(_.id) should contain(olderPackageId.toString)
    filtered.map(_.id) should not contain newerPackageId.toString
  }

  "should filter packages by day when strictTimestamp is enabled" taggedAs UsesDatabase in {
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

    val strict = editionsDB.getPackages(
      None,
      Some(dayStart),
      strictTimestamp = true
    )

    strict.map(_.id) should contain(inDayPackage.toString)
    strict.map(_.id) should not contain previousDayPackage.toString
  }

  "should update package name" taggedAs UsesDatabase in {
    val packageId = UUID.randomUUID()
    val createdOn = now.toInstant.toEpochMilli
    insertPackage(packageId, "Original name", createdOn)

    val updated = editionsDB.updatePackageName(
      packageId,
      "Renamed package",
      userName = "New Name",
      userEmail = "new.name@guardian.co.uk"
    )

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

    editionsDB.updateHidden(
      packageId,
      newValue = true,
      userName = "New name",
      userEmail = "new.name@guardian.co.uk"
    )

    val loaded = editionsDB.getPackages(
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
      id = packageId.toString,
      name = "Updated package",
      isHidden = true,
      webMetadata = Some(Json.obj("source" -> "update")),
      feastMetadata =
        Some(FeastPackageMetadata(bodyText = Some("text goes here"))),
      prefill = Some("updated-prefill"),
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

    editionsDB.updatePackage(updatedMetadata, Seq(updatedExistingCard, newCard))

    val loadedPackage =
      editionsDB
        .getPackages(Some(Seq(packageId)), None, strictTimestamp = false)
        .head
    loadedPackage.name shouldBe "Updated package"
    loadedPackage.isHidden shouldBe true
    loadedPackage.prefill shouldBe Some("updated-prefill")

    val loadedCards = editionsDB.getPackageCards(packageId)
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
  }
}
