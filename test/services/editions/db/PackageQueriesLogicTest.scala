package services.editions.db

import model.packages.PackageCardType.Recipe
import model.packages.{PackageCard, PackageCardRow}
import org.scalatest.{FreeSpec, Matchers}

import java.time.OffsetDateTime
import scala.language.reflectiveCalls //stop compiler warning about using the override to call into a protected method

class PackageQueriesLogicTest extends FreeSpec with Matchers {
  private val packageQueries = new PackageQueries {
    def callFindCardsToReindex(
        existingIndices: List[(String, Int)],
        packageCards: Seq[PackageCardRow]
    ) = findCardsToReindex(existingIndices, packageCards)
  }

  private def makePackageCardRow(pageCode: String, index: Int) = PackageCardRow(
    "fakepackage",
    Recipe,
    pageCode,
    index,
    metadata = None,
    addedOn = OffsetDateTime.now(),
    addedBy = "test runner",
    addedEmail = "test.runner@nodomain.net"
  )

  "should ensure monotonic numbering when adding cards" in {
    val existing = List(
      ("recipe-1", 0),
      ("recipe-2", 1),
      ("recipe-4", 3),
      ("recipe-5", 4)
    )

    val toInsert = Seq(
      makePackageCardRow("recipe-new-3", 2),
      makePackageCardRow("recipe-new-4", 3)
    )

    val updates = packageQueries.callFindCardsToReindex(existing, toInsert)
    updates.sortBy(_._2) shouldEqual List(
      (
        "recipe-new-3",
        2
      ), // added in an empty slot (previously deleted occupant)
      ("recipe-new-4", 3), // added over previous occupier of slot 3
      ("recipe-4", 4), // previous occupier of slot 3 is pushed down to 4
      ("recipe-5", 5) // previous occupier of slot 4 is pushed down to 5
    )
  }

  "should fill gaps if there are no insertions" in {
    val existing = List(
      ("recipe-1", 0),
      ("recipe-2", 1),
      ("recipe-4", 3),
      ("recipe-5", 4)
    )

    val toInsert = Seq.empty

    val updates = packageQueries.callFindCardsToReindex(existing, toInsert)
    updates.sortBy(_._2) shouldEqual List(
      ("recipe-4", 2), // moved up to fill empty slot 2
      ("recipe-5", 3) // moved up to fill newly empty slot 3
    )
  }

  "should return an empty list if there are no changes to make" in {
    val existing = List(
      ("recipe-1", 0),
      ("recipe-2", 1),
      ("recipe-4", 2),
      ("recipe-5", 3)
    )

    val toInsert = Seq.empty

    val updates = packageQueries.callFindCardsToReindex(existing, toInsert)
    updates shouldBe empty
  }

  "should return an empty list if there is no content" in {
    val existing = List.empty
    val toInsert = Seq.empty

    val updates = packageQueries.callFindCardsToReindex(existing, toInsert)
    updates shouldBe empty
  }
}
