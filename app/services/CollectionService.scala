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
        frontsApi.amazonClient.collection(collectionId).map(_.map(collection => {
          val stages = CollectionService.getStoriesForCollectionStages(collectionId, collection, config)
          val containerType = config.collections.get(collectionId).flatMap(_.`type`)
          val maybeStoriesVisible = containerType match {
            case Some(cType) => Some(
              (
                containerService.getStoriesVisible(cType, stages._1),
                containerService.getStoriesVisible(cType, stages._2)
              ))
            case None => None
          }
          val storiesVisibleByStage = maybeStoriesVisible match {
            case Some(storiesVisible) => Some(StoriesVisibleByStage(storiesVisible._1, storiesVisible._2))
            case None => None
          }
          CollectionAndStoriesResponse(collection, storiesVisibleByStage)
        }))
      })
      Future.sequence(futures).map(_.flatten)
    }
  }
}

object CollectionService {
  def getStoriesForCollectionStages(collectionId: String, collection: CollectionJson, config: ConfigJson) = {
    val maybeNumberOfGroups = config.collections.get(collectionId) match {
      case Some(collectionConfig) => collectionConfig.groups.map(group => group.length)
      case None => None
    }
    val numberOfGroups = maybeNumberOfGroups.getOrElse(0)

    (
      Some(collection.live).map { getStoriesForStage(_, numberOfGroups) }.getOrElse(Seq()),
      collection.draft.map { getStoriesForStage(_, numberOfGroups) }.getOrElse(Seq())
    )
  }

  def getStoriesForStage(stage: List[Trail], numberOfGroups: Int) = {
    stage.zipWithIndex.map {
      case (article, index) => Story(
        numberOfGroups - index - 1,
        article.meta.flatMap(_.isBoosted).getOrElse(false)
      )}.toSeq
  }
}
