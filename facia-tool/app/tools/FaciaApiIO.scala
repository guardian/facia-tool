package tools

import com.gu.facia.client.models.{CollectionJson, ConfigJson}
import com.gu.pandomainauth.model.User
import frontsapi.model.CollectionJsonFunctions
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json.{JsValue, _}
import services.{FrontsApi, S3FrontsApi}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

trait FaciaApiRead {
  def getSchema: Option[String]
  def getCollectionJson(id: String): Future[Option[CollectionJson]]
}

trait FaciaApiWrite {
  def putCollectionJson(id: String, collectionJson: CollectionJson): CollectionJson
  def publishCollectionJson(id: String, identity: User): Future[Option[CollectionJson]]
  def discardCollectionJson(id: String, identity: User): Future[Option[CollectionJson]]
  def archive(id: String, collectionJson: CollectionJson, update: JsValue, identity: User): Unit
}

object FaciaApiIO extends FaciaApiRead with FaciaApiWrite {

  def getSchema = S3FrontsApi.getSchema

  def getCollectionJson(id: String): Future[Option[CollectionJson]] = FrontsApi.amazonClient.collection(id)

  def putCollectionJson(id: String, collectionJson: CollectionJson): CollectionJson = {
    Try(S3FrontsApi.putCollectionJson(id, Json.prettyPrint(Json.toJson(collectionJson))))
    collectionJson
  }

  private def mutateCollectionJson(f: User => CollectionJson => Option[CollectionJson])
                         (id: String, identity: User): Future[Option[CollectionJson]] =
    getCollectionJson(id)
      .map { maybeCollectionJson =>
      maybeCollectionJson
        .flatMap(f(identity))
        .map(putCollectionJson(id, _))}

  def publishCollectionJson(id: String, identity: User) = mutateCollectionJson(FaciaApi.preparePublishCollectionJson)(id, identity)

  def discardCollectionJson(id: String, identity: User) = mutateCollectionJson(FaciaApi.prepareDiscardCollectionJson)(id, identity)

  def archive(id: String, collectionJson: CollectionJson, update: JsValue, identity: User): Unit = {
    Json.toJson(collectionJson).transform[JsObject](Reads.JsObjectReads) match {
      case JsSuccess(result, _) =>
        S3FrontsApi.archive(id, Json.prettyPrint(result + ("diff", update)), identity)
      case JsError(errors)  => Logger.warn(s"Could not archive $id: $errors")}}

  def putMasterConfig(config: ConfigJson): Option[ConfigJson] = {
    Try(S3FrontsApi.putMasterConfig(Json.prettyPrint(Json.toJson(config)))).map(_ => config).toOption
  }
  def archiveMasterConfig(config: ConfigJson, identity: User): Unit = S3FrontsApi.archiveMasterConfig(Json.prettyPrint(Json.toJson(config)), identity)

}

/**
 * this is the pure and unit testable stuff for the FaciaApiIO
 */
object FaciaApi {

  // testable
  def preparePublishCollectionJson(identity: User)(collectionJson: CollectionJson): Option[CollectionJson] =
    Some(collectionJson)
      .filter(_.draft.isDefined)
      .map(updatePublicationDateForNew)
      .map(CollectionJsonFunctions.updatePreviouslyForPublish)
      .map(collectionJson => collectionJson.copy(live = collectionJson.draft.get, draft = None))
      .map(updateIdentity(_, identity))

  def prepareDiscardCollectionJson(identity: User)(collectionJson: CollectionJson): Option[CollectionJson] =
    Some(collectionJson)
      .map(_.copy(draft = None))
      .map(updateIdentity(_, identity))

  def updateIdentity(collectionJson: CollectionJson, identity: User): CollectionJson = collectionJson.copy(lastUpdated = DateTime.now, updatedBy = identity.firstName + " " + identity.lastName, updatedEmail = identity.email)

  def updatePublicationDateForNew(collectionJson: CollectionJson): CollectionJson = {
    val liveIds = collectionJson.live.map(_.id).toSet
    val draftsWithNewDate = collectionJson.draft.get.map {
      draft =>
        if (liveIds.contains(draft.id)) draft
        else draft.copy(frontPublicationDate = DateTime.now.getMillis)
    }
    collectionJson.copy(draft = Some(draftsWithNewDate))
  }

}
