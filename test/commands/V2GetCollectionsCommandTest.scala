package commands

import com.gu.facia.client.models.{CollectionJson}
import controllers.CollectionSpec
import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}
import services.{CollectionAndStoriesResponse}

class V2GetCollectionsCommandTest extends FreeSpec with Matchers {
  val now = new DateTime()
  val yesterday = now.minusDays(1)
  val tomorrow = now.plusDays(1)

  private def createCollectionSpec(
      id: String,
      lastUpdated: Option[Long] = None
  ) = {
    CollectionSpec(id, lastUpdated)
  }

  private def createCollectionJson(lastUpdated: DateTime) = {
    CollectionJson(
      live = List(),
      draft = None,
      treats = None,
      lastUpdated = lastUpdated,
      updatedBy = "",
      updatedEmail = "",
      displayName = None,
      href = None,
      previously = None,
      targetedTerritory = None
    )
  }

  private def createCollectionAndStoriesResponse(
      id: String,
      lastUpdated: DateTime
  ): CollectionAndStoriesResponse = {
    CollectionAndStoriesResponse(id, createCollectionJson(lastUpdated), None)
  }

  "keepOnlyNewerCollectionData" - {
    "should return all collection response data if CollectionSpecs has no lastUpdated key" in {
      val specs = List(
        createCollectionSpec("id1"),
        createCollectionSpec("id2")
      )
      val responses = List(
        Some(createCollectionAndStoriesResponse("id1", now)),
        Some(createCollectionAndStoriesResponse("id2", yesterday))
      )
      V2GetCollectionsCommand.keepOnlyNewerCollectionData(
        specs,
        responses
      ) should be(responses.flatten)
    }

    "should return only collection response data when CollectionResponse has more recent lastUpdated data than CollectionSpecs" in {
      val specs = List(
        createCollectionSpec("id1", Some(now.getMillis())),
        createCollectionSpec("id2", Some(now.getMillis())),
        createCollectionSpec("id3", Some(now.getMillis()))
      )
      val responses = List(
        Some(createCollectionAndStoriesResponse("id1", now)),
        Some(createCollectionAndStoriesResponse("id2", yesterday)),
        Some(createCollectionAndStoriesResponse("id3", tomorrow))
      )
      V2GetCollectionsCommand.keepOnlyNewerCollectionData(
        specs,
        responses
      ) should be(
        List(
          createCollectionAndStoriesResponse("id3", tomorrow)
        )
      )
    }

    "should return an empty list when all CollectionResponse items have older lastUpdated data than CollectionSpecs" in {
      val specs = List(
        createCollectionSpec("id1", Some(now.getMillis())),
        createCollectionSpec("id2", Some(now.getMillis())),
        createCollectionSpec("id3", Some(now.getMillis()))
      )
      val responses = List(
        Some(createCollectionAndStoriesResponse("id1", yesterday)),
        Some(createCollectionAndStoriesResponse("id2", yesterday)),
        Some(createCollectionAndStoriesResponse("id3", yesterday))
      )
      V2GetCollectionsCommand.keepOnlyNewerCollectionData(
        specs,
        responses
      ) should be(List())
    }
  }

}
