package logic

import java.time.LocalDate
import model.editions.Edition.DailyEdition
import model.editions.{
  CuratedPlatform,
  EditionsCard,
  EditionsCollection,
  EditionsFront,
  EditionsFrontMetadata,
  EditionsIssue
}
import org.scalatest.{FreeSpec, Matchers}

class EditionsCheckerTest extends FreeSpec with Matchers {

  "preflight checks for issue" - {
    "empty issue" in {
      val issue = getIssue()
      EditionsChecker.checkIssue(issue)(0) shouldEqual "Issue is empty"
    }
  }

  "preflight checks for issues with fronts" - {
    "empty front" in {
      val front = getFront()
      val issue = getIssue(front)
      EditionsChecker
        .checkIssue(issue)
        .head shouldEqual "Front 'displayName' is visible and empty"
    }
    "no visible fronts" in {
      val c = getCollection()
      val front = getFront(c)
        .copy(displayName = "First hidden front", isHidden = true)
      val issue = getIssue(front)
      EditionsChecker.checkIssue(issue).headOption shouldEqual (Some(
        "Issue contains no visible fronts"
      ))
    }
    "non-empty special front" in {
      val c = getCollection()
      val front = getFront(c)
        .copy(displayName = "Top Special Front")
      val issue = getIssue(front)
      EditionsChecker
        .checkIssue(issue)
        .head shouldEqual "Collection 'displayName' in 'Top Special Front' is visible and empty"
    }
  }

  "preflight checks for issues with fronts with collections" - {
    "empty hidden collection" in {
      val c = getCollection()
        .copy(isHidden = true)
      val front = getFront(c)
      val issue = getIssue(front)
      EditionsChecker
        .checkIssue(issue)
        .head shouldEqual "Front 'displayName' is visible and empty"
    }
    "empty collection" in {
      val c = getCollection()
      val front = getFront(c)
      val issue = getIssue(front)
      EditionsChecker
        .checkIssue(issue)
        .head shouldEqual "Collection 'displayName' in 'displayName' is visible and empty"
    }
    "non-empty special collection" in {
      val c = getCollection()
        .copy(displayName = "Special Collection, oh yes")
      val front = getFront(c)
      val issue = getIssue(front)
      EditionsChecker
        .checkIssue(issue)
        .head shouldEqual "Collection 'Special Collection, oh yes' in 'displayName' is visible and empty"
    }
  }

  private def getCollection(items: EditionsCard*) = {
    EditionsCollection(
      "id",
      "displayName",
      false,
      None,
      None,
      None,
      None,
      None,
      items.toList,
	  None,
	  None
    )
  }

  "preflight checks for issues with fronts with collections" - {}

  private def getFront(collection: EditionsCollection*) = {
    EditionsFront(
      "id",
      "displayName",
      1,
      false,
      false,
      None,
      None,
      None,
      None,
      collection.toList
    )
  }

  private def getIssue(fronts: EditionsFront*) = {
    EditionsIssue(
      "id",
      DailyEdition,
      CuratedPlatform.Editions,
      "timezoneId",
      LocalDate.now(),
      LocalDate.now().toEpochDay,
      "createdBy",
      "createdEmail",
      None,
      None,
      None,
      fronts.toList,
      supportsProofing = true
    )
  }

}
