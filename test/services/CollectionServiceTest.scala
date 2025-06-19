package services

import com.gu.facia.client.models.{
  CollectionConfigJson,
  CollectionJson,
  ConfigJson,
  FrontJson,
  GroupConfigJson,
  Trail
}
import conf.ApplicationConfiguration
import org.joda.time.DateTime
import org.scalatest.{FreeSpec, Matchers}
import play.api.Configuration
import slices.{Containers, FixedContainers}

class CollectionServiceTest extends FreeSpec with Matchers {
  val configuration = Configuration("example" -> "config")
  val config = new ApplicationConfiguration(configuration, false)
  val fixedContainers = new FixedContainers(config)
  val containers = new Containers(fixedContainers)
  val containerService = new ContainerService(containers)

  "getArticleDetailsForCollection" - {
    "should return article details for a given collection" in {
      CollectionService.getStoriesVisibleByStage(
        "id",
        collectionJson,
        configJson,
        containerService
      ) should be(
        getStoriesVisible(1, 1, 2, 2)
      )
    }
  }

  private def getStoriesVisible(
      liveDesktop: Int,
      liveMobile: Int,
      draftDesktop: Int,
      draftMobile: Int
  ) = {
    Some(
      StoriesVisibleByStage(
        Some(
          StoriesVisibleResponse(
            Some(liveDesktop),
            Some(liveMobile)
          )
        ),
        Some(
          StoriesVisibleResponse(
            Some(draftDesktop),
            Some(draftMobile)
          )
        )
      )
    )
  }

  private def collectionJson: CollectionJson = {
    val live = List(Trail("existingId", 0, Some(""), None))
    val draft = Trail("newId", 0, Some(""), None) :: live
    CollectionJson(
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
  }

  private def configJson: ConfigJson = {
    ConfigJson(
      Map[String, FrontJson](),
      Map[String, CollectionConfigJson]("id" -> collectionConfig)
    )
  }

  private def collectionConfig: CollectionConfigJson = {
    CollectionConfigJson(
      displayName = Some("Example collection"),
      backfill = None,
      metadata = None,
      `type` = Some("dynamic/slow"),
      href = None,
      description = None,
      groups = Some(List("Group 1", "Group 2")),
      groupsConfig = Some(
        List(
          GroupConfigJson(name = "Group 1", maxItems = Some(10)),
          GroupConfigJson(name = "Group 2", maxItems = Some(10))
        )
      ),
      uneditable = None,
      showTags = None,
      showSections = None,
      hideKickers = None,
      showDateHeader = None,
      showLatestUpdate = None,
      excludeFromRss = None,
      showTimestamps = None,
      hideShowMore = None,
      displayHints = None,
      userVisibility = None,
      targetedTerritory = None,
      platform = None,
      frontsToolSettings = None
    )
  }
}
