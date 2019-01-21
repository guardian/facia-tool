package services

import com.gu.facia.client.models.{CollectionJson, ConfigJson, Trail}
import metrics.FaciaToolMetrics
import play.api.libs.json.Json
import slices.Story

import scala.concurrent.{ExecutionContext, Future}

case class StoriesVisibleByStage(live: Option[StoriesVisibleResponse], draft: Option[StoriesVisibleResponse])

object StoriesVisibleByStage {
  implicit val jsonFormat = Json.format[StoriesVisibleByStage]
}

case class CollectionAndStoriesResponse(collection: CollectionJson, storiesVisibleByStage: Option[StoriesVisibleByStage])

object CollectionAndStoriesResponse {
  implicit val jsonFormat = Json.format[CollectionAndStoriesResponse]
}

class CollectionService(frontsApi: FrontsApi, containerService: ContainerService)(implicit ec: ExecutionContext) {
  def fetchCollections(collectionIds: List[String]) = {
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.flatMap { config =>
      val futures = collectionIds.map(collectionId => {
        frontsApi.amazonClient.collection(collectionId).flatMap {
          case Some(collection) => {
            val collectionAndStoriesResponse = CollectionAndStoriesResponse(collection,
              CollectionService.getStoriesVisibleByStage(
                collectionId,
                collection,
                config,
                containerService
              )
            )
            Future.successful(collectionAndStoriesResponse)
          }
          case None => Future.successful(None)
        }
      })
      Future.sequence(futures)
    }
  }
}

object CollectionService {
  def getStoriesVisibleByStage(collectionId: String, collection: CollectionJson, config: ConfigJson, containerService: ContainerService): Option[StoriesVisibleByStage] = {
    val stages = CollectionService.getStoriesForCollectionStages(collectionId, collection, config)
    config.collections.get(collectionId).flatMap(_.`type`) match {
      case Some(cType) => Some(
        StoriesVisibleByStage(
          containerService.getStoriesVisible(cType, stages._1),
          containerService.getStoriesVisible(cType, stages._2)
        )
      )
      case None => None
    }
  }

  def getStoriesForCollectionStages(collectionId: String, collection: CollectionJson, config: ConfigJson): (Seq[Story], Seq[Story]) = {
    val numberOfGroups = config.collections.get(collectionId) match {
      case Some(collectionConfig) => collectionConfig.groups.map(group => group.length).getOrElse(0)
      case None => 0
    }

    (
      Some(collection.live).map { getStoriesForStage(_, numberOfGroups) }.getOrElse(Seq()),
      collection.draft.map { getStoriesForStage(_, numberOfGroups) }.getOrElse(Seq())
    )
  }

  def getStoriesForStage(stage: List[Trail], numberOfGroups: Int): Seq[Story] = {
    stage.zipWithIndex.map {
      case (article, index) => Story(
        numberOfGroups - index - 1,
        article.meta.flatMap(_.isBoosted).getOrElse(false)
      )}
  }
}
