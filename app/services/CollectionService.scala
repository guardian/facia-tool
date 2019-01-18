package services

import com.gu.facia.client.models.{CollectionJson, ConfigJson}
import metrics.FaciaToolMetrics
import play.api.libs.json.Json
import slices.Story

import scala.concurrent.{ExecutionContext, Future}

class CollectionService(frontsApi: FrontsApi, containerService: ContainerService)(implicit ec: ExecutionContext) {
  def fetchCollections(collectionIds: List[String], config: ConfigJson) = {
    FaciaToolMetrics.ApiUsageCount.increment()
    val futures = collectionIds.map(collectionId => {
      frontsApi.amazonClient.collection(collectionId).map(_.map(collection => {
        val stages = CollectionService.getStoriesForCollectionStages(collectionId, collection, config)
        val containerType = config.collections.get(collectionId).flatMap(_.`type`)
        val storiesVisible = containerType match {
          case Some(cType) => stages.map(stories => containerService.getStoriesVisible(cType, stories))
          case None => List(None, None)
        }
        (collection, storiesVisible)
      }))
    })
    Future.sequence(futures).map(_.flatten)
  }
}

object CollectionService {
  def getStoriesForCollectionStages(collectionId: String, collection: CollectionJson, config: ConfigJson) = {
    val numberOfGroups = config.collections.get(collectionId).map(_.groups.map(_.length)).getOrElse(0)

    List(Some(collection.live), collection.draft).flatten.map(_.zipWithIndex.map {
      case (article, index) => Story(
        numberOfGroups - index - 1,
        article.meta.flatMap(_.isBoosted).getOrElse(false)
      )})
  }
}
