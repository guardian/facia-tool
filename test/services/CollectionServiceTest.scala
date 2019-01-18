package services

import com.gu.facia.client.models.{CollectionJson, Trail}
import org.joda.time.DateTime
import org.scalatest.{DoNotDiscover, FreeSpec, Matchers}
import slices.Story

@DoNotDiscover class CollectionServiceTest extends FreeSpec with Matchers {
  "getArticleDetailsForCollection" - {
    "should return article details for a given collection" in {
      CollectionService.getArticleDetailsForCollection(collectionJson) should be(
        Seq(Story(1, true))
      )
    }
  }

  private def collectionJson: CollectionJson = {
    val live = List(Trail("existingId", 0, Some(""), None))
    val draft = Trail("newId", 0, Some(""), None) :: live
    CollectionJson(live, Some(draft), None, new DateTime(0), "oldUpdatedBy", "oldUpdatedEmail", None, None, None)
  }
}
