package services

import com.gu.facia.client.models.CollectionJson
import metrics.FaciaToolMetrics
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future}

case class ArticleDetails(group: Int, isBoosted: Boolean)

object ArticleDetails {
  implicit val jsonFormat = Json.format[ArticleDetails]
}

class CollectionService(frontsApi: FrontsApi)(implicit ec: ExecutionContext) {
  def fetchCollections(collectionIds: List[String]): Future[List[Option[CollectionJson]]] = {
    FaciaToolMetrics.ApiUsageCount.increment()
    val futures = collectionIds.map(collectionId => frontsApi.amazonClient.collection(collectionId))
    Future.sequence(futures).map(_.map(_.map(collection => {
        collection
      })
    ))
  }
}

object CollectionService {
  def getArticleDetailsForCollection(collection: CollectionJson): Unit = {

  }
}
