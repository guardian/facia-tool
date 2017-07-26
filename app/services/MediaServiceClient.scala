package services

import com.gu.facia.client.models.{CollectionJson, Trail, TrailMetaData}
import play.api.libs.json.JsString
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class MediaServiceClient(val mediaApi: MediaApi) {

  def getThumbnail(imageSrc: String):Future[Option[String]] = {
    val imageIdRegex = "[0-9a-z]{40}".r

    val thumbnail = for {
      imageId <- imageIdRegex findFirstIn imageSrc
      cropIdRegex = s"\\/$imageId\\/([^\\/]+)".r
      mediaAndCropId <- cropIdRegex findFirstIn imageSrc
      cropId = mediaAndCropId.replace(s"/$imageId/", "")
    } yield mediaApi.getThumbnail(imageId, cropId)

    thumbnail match {
      case Some(t) => t
      case None => Future(None)
    }
  }

  private def replaceThumbnailInTrail(trail: Trail, meta: TrailMetaData, thumbnail: String): Trail = {
    trail.copy(meta = Some(meta.copy(
      json = meta.json + ("imageSrcThumb" -> JsString(thumbnail))
    )))
  }

  private def addThumbnailToTrail(trail: Trail): Future[Trail] = {
    val trailWithThumbnail = for {
      meta <- trail.meta
      imgSrc <- meta.imageSrc
    } yield {
      getThumbnail(imgSrc).map {
        case Some(t) => replaceThumbnailInTrail(trail, meta, t)
        case None => trail
      }
    }
    trailWithThumbnail.getOrElse(Future(trail))
  }

  def addThumbnailUrlsToTrailList(list: List[Trail]): Future[List[Trail]] = {
    val trails = list.map(addThumbnailToTrail)
    Future.sequence(trails)
  }

  def addThumbnailsToCollection(collection: CollectionJson): Future[CollectionJson] = {
    val collectionWithThumbnails = collection.draft.map(draft => {
      for {
        d <- addThumbnailUrlsToTrailList(draft)
        l <- addThumbnailUrlsToTrailList(collection.live)
      } yield collection.copy(live = l, draft = Some(d))
    })
    collectionWithThumbnails.getOrElse(Future(collection))
  }
}
