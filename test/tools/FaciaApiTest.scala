package tools

import com.gu.facia.client.models.{CollectionJson, Test, Trail}
import com.gu.pandomainauth.model.User
import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}

class FaciaApiTest extends FreeSpec with Matchers {

  "update the published date only for a new article and retain existing article date" - {

    val (identity: User, collectionJson: CollectionJson) =
      scenarioOneLiveAnotherDraft

    val newCollectionJson =
      FaciaApi.preparePublishCollectionJson(identity)(collectionJson).get

    "no draft articles" in {
      newCollectionJson.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newCollectionJson.live}>") {
        newCollectionJson.live.size should be(2)
      }
    }
    "existing article should have the old date" in {
      newCollectionJson.live.collect {
        case Trail("existingId", 0, Some(""), _, _) => true
      } should have(Symbol("length")(1))
    }
    "new article should have an updated timestamp" in {
      newCollectionJson.live.collect {
        case Trail("newId", t, Some(""), _, _) if t != 0 => true
      } should have(Symbol("length")(1))
    }

  }

  "discard the drafts without changing live" - {

    val (identity: User, collectionJson: CollectionJson) =
      scenarioOneLiveAnotherDraft

    val newCollectionJson =
      FaciaApi.prepareDiscardCollectionJson(identity)(collectionJson).get

    "no draft articles" in {
      newCollectionJson.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newCollectionJson.live}>") {
        newCollectionJson.live.size should be(1)
      }
    }
    "existing article should have the old date" in {
      newCollectionJson.live.collect {
        case Trail("existingId", 0, Some(""), _, _) => true
      } should have(Symbol("length")(1))
    }

  }

  "set AB test start/expiry dates on publish" - {

    def testFor(id: String, collectionJson: CollectionJson): Test =
      collectionJson.live
        .find(_.id == id)
        .flatMap(_.tests)
        .flatMap(_.headOption)
        .getOrElse(fail(s"expected a test on trail <$id>"))

    "sets dates on an active (not manually ended) test that has none" in {
      val (identity, collectionJson) = scenarioWithTests
      val newCollectionJson =
        FaciaApi.preparePublishCollectionJson(identity)(collectionJson).get

      val test = testFor("activeTestId", newCollectionJson)
      test.startDate should be(Symbol("defined"))
      test.expiryDate should be(Symbol("defined"))
    }

    "does NOT set dates on a manually ended test" in {
      val (identity, collectionJson) = scenarioWithTests
      val newCollectionJson =
        FaciaApi.preparePublishCollectionJson(identity)(collectionJson).get

      val test = testFor("endedTestId", newCollectionJson)
      test.startDate should be(None)
      test.expiryDate should be(None)
    }

    "does not overwrite existing dates on an active test" in {
      val (identity, collectionJson) = scenarioWithTests
      val newCollectionJson =
        FaciaApi.preparePublishCollectionJson(identity)(collectionJson).get

      val test = testFor("existingDatesTestId", newCollectionJson)
      test.startDate should be(Some(1000L))
      test.expiryDate should be(Some(2000L))
    }
  }

  private def makeTest(
      hasManuallyEndedOnThisTrail: Boolean,
      startDate: Option[Long] = None,
      expiryDate: Option[Long] = None
  ): Test = Test(
    testUuid = "uuid",
    variantMeta = Nil,
    startDate = startDate,
    expiryDate = expiryDate,
    createdByName = "Test Author",
    createdByEmail = "author@email.com",
    frontsThisTestCanRunOn = Nil,
    hasManuallyEndedOnThisTrail = hasManuallyEndedOnThisTrail,
    manuallyEndedOnThisTrailByName = None,
    manuallyEndedOnThisTrailByEmail = None
  )

  private def scenarioWithTests: (User, CollectionJson) = {
    val identity = User("John", "Duffell", "email@email.com", None)
    val draft = List(
      Trail(
        "activeTestId",
        0,
        Some(""),
        None,
        Some(List(makeTest(hasManuallyEndedOnThisTrail = false)))
      ),
      Trail(
        "endedTestId",
        0,
        Some(""),
        None,
        Some(List(makeTest(hasManuallyEndedOnThisTrail = true)))
      ),
      Trail(
        "existingDatesTestId",
        0,
        Some(""),
        None,
        Some(
          List(
            makeTest(
              hasManuallyEndedOnThisTrail = false,
              startDate = Some(1000L),
              expiryDate = Some(2000L)
            )
          )
        )
      )
    )
    val collectionJson = CollectionJson(
      Nil,
      Some(draft),
      None,
      new DateTime(0),
      "oldUpdatedBy",
      "oldUpdatedEmail",
      None,
      None,
      None,
      None
    )
    (identity, collectionJson)
  }

  private def scenarioOneLiveAnotherDraft: (User, CollectionJson) = {
    val identity = User("John", "Duffell", "email@email.com", None)
    val live = List(Trail("existingId", 0, Some(""), None, None))
    val draft = Trail("newId", 0, Some(""), None, None) :: live
    val collectionJson = CollectionJson(
      live,
      Some(draft),
      None,
      new DateTime(0),
      "oldUpdatedBy",
      "oldUpdatedEmail",
      None,
      None,
      None,
      None
    )
    (identity, collectionJson)
  }
}
