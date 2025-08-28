package services

import com.gu.facia.client.models.{CollectionJson, ConfigJson, Trail}
import metrics.FaciaToolMetrics
import play.api.libs.json.{Json, OFormat}
import slices.Story

import scala.concurrent.{ExecutionContext, Future}

case class StoriesVisibleByStage(
    live: Option[StoriesVisibleResponse],
    draft: Option[StoriesVisibleResponse]
)

object StoriesVisibleByStage {
  implicit val jsonFormat: OFormat[StoriesVisibleByStage] =
    Json.format[StoriesVisibleByStage]
}

case class CollectionAndStoriesResponse(
    id: String,
    collection: CollectionJson,
    storiesVisibleByStage: Option[StoriesVisibleByStage]
) {
  // getOrElse ensures that if millis is None
  // this method will return true assuming i.e. that it was updatedAfter no time
  def wasUpdatedAfter(millis: Option[Long]): Boolean =
    collection.lastUpdated.getMillis() > millis.getOrElse(-1L)
}

object CollectionAndStoriesResponse {
  implicit val jsonFormat: OFormat[CollectionAndStoriesResponse] =
    Json.format[CollectionAndStoriesResponse]
}

class CollectionService(
    frontsApi: FrontsApi,
    containerService: ContainerService
)(implicit ec: ExecutionContext) {

  def fetchCollection(collectionId: String): Future[Option[CollectionJson]] = {
    frontsApi.amazonClient.collection(collectionId)
  }

  def fetchStoriesVisibleForCollection(
      collectionId: String,
      collection: CollectionJson
  ): Future[Option[CollectionAndStoriesResponse]] = {
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.flatMap { config =>
      val collectionAndStoriesResponse = CollectionAndStoriesResponse(
        collectionId,
        collection,
        CollectionService.getStoriesVisibleByStage(
          collectionId,
          collection,
          config,
          containerService
        )
      )
      Future.successful(Some(collectionAndStoriesResponse))
    }
  }

  def fetchCollectionsAndStoriesVisible(
      collectionIds: List[String]
  ): Future[List[Option[CollectionAndStoriesResponse]]] = {
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.flatMap { config =>
      val futures = collectionIds.map { collectionId =>
        fetchCollection(collectionId).flatMap {
          case Some(collection) => {
            val collectionAndStoriesResponse = CollectionAndStoriesResponse(
              collectionId,
              collection,
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
  def getStoriesVisibleByStage(
      collectionId: String,
      collection: CollectionJson,
      config: ConfigJson,
      containerService: ContainerService
  ): Option[StoriesVisibleByStage] = {
    val stages =
      CollectionService.getStoriesForCollectionStages(collectionId, collection)
    for {
      cConfigJson <- config.collections.get(collectionId)
      cType <- cConfigJson.`type`
    } yield {
      StoriesVisibleByStage(
        containerService
          .getStoriesVisible(
            cType,
            stages._1,
            Some(cConfigJson)
          ),
        containerService
          .getStoriesVisible(
            cType,
            stages._2,
            Some(cConfigJson)
          )
      )
    }
  }

  def getStoriesForCollectionStages(
      collectionId: String,
      collection: CollectionJson
  ): (Seq[Story], Seq[Story]) = {
    val liveStages =
      Some(collection.live).map(getStoriesForStage).getOrElse(Seq())
    val draftStages =
      collection.draft.map(getStoriesForStage).getOrElse(liveStages)
    (
      liveStages,
      draftStages
    )
  }

  def getStoriesForStage(trailsInStage: List[Trail]): Seq[Story] = {
    trailsInStage.map { article =>
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
    }
  }
}
