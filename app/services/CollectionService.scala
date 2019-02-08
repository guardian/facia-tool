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

  def fetchCollection(collectionId: String): Future[Option[CollectionJson]] = {
    frontsApi.amazonClient.collection(collectionId)
  }

  def fetchCollectionsAndStoriesVisible(collectionIds: List[String]): Future[List[Option[CollectionAndStoriesResponse]]] = {
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.flatMap { config =>
      val futures = collectionIds.map { collectionId => fetchCollection(collectionId).flatMap {
          case Some(collection) => {
            val collectionAndStoriesResponse = CollectionAndStoriesResponse(collection,
              CollectionService.getStoriesVisibleByStage(
                collectionId,
                collection,
                config,
                containerService
              )
            )
            Future.successful(Some(collectionAndStoriesResponse))
          }
          case None => Future.successful(None)
        }
      }
      Future.sequence(futures)
    }
  }
}

object CollectionService {
  def getStoriesVisibleByStage(collectionId: String, collection: CollectionJson, config: ConfigJson, containerService: ContainerService): Option[StoriesVisibleByStage] = {
    val stages = CollectionService.getStoriesForCollectionStages(collectionId, collection)
    config.collections.get(collectionId).flatMap(_.`type`) match {
      case Some(cType) =>
        Some(
        StoriesVisibleByStage(
          containerService.getStoriesVisible(cType, stages._1),
          containerService.getStoriesVisible(cType, stages._2)
        )
      )
      case None => None
    }
  }

  def getStoriesForCollectionStages(collectionId: String, collection: CollectionJson): (Seq[Story], Seq[Story]) = {
    val liveStages = Some(collection.live).map(getStoriesForStage).getOrElse(Seq())

    (
      liveStages,
      collection.draft.map(getStoriesForStage).getOrElse(liveStages)
    )
  }

  def getStoriesForStage(stage: List[Trail]): Seq[Story] = {
    stage.map { article =>
      val maybeGroup = for {
        meta <- article.meta
        group <- meta.group
      } yield {
        group.toInt
      }
      val group = maybeGroup.getOrElse(0)
      Story(
        group,
        article.meta.flatMap(_.isBoosted).getOrElse(false)
      )
    }.sortBy(_.group).reverse
  }
}
