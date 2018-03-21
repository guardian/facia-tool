package controllers

import _root_.util.Acl
import akka.actor.ActorSystem
import auth.PanDomainAuthActions
import com.gu.facia.client.models.Metadata
import com.gu.pandomainauth.action.UserRequest
import conf.ApplicationConfiguration
import frontsapi.model._
import metrics.FaciaToolMetrics
import model.NoCache
import permissions.BreakingNewsEditCollectionsCheck
import play.api.Logger
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._
import services._
import tools.FaciaApiIO
import updates._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class FaciaToolController(val config: ApplicationConfiguration, val acl: Acl, val frontsApi: FrontsApi, val faciaApiIO: FaciaApiIO, val updateActions: UpdateActions,
                          breakingNewsUpdate: BreakingNewsUpdate, val auditingUpdates: AuditingUpdates, val faciaPress: FaciaPress, val faciaPressQueue: FaciaPressQueue,
                          val configAgent: ConfigAgent, val s3FrontsApi: S3FrontsApi, val mediaServiceClient: MediaServiceClient, val wsClient: WSClient) extends Controller with PanDomainAuthActions with BreakingNewsEditCollectionsCheck {

  override lazy val actorSystem = ActorSystem()

  def getConfig = APIAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")}}}

  def getCollection(collectionId: String) = APIAuthAction.async { request =>

    FaciaToolMetrics.ApiUsageCount.increment()
    val collection = frontsApi.amazonClient.collection(collectionId).flatMap{ collectionJson =>
      collectionJson.map(mediaServiceClient.addThumbnailsToCollection) match {
        case Some(f) => f.map(Some(_))
        case None    => Future.successful(None)
      }
    }
    collection.map(c => NoCache {
      Ok(Json.toJson(c)).as("application/json")})
  }

  def publishCollection(collectionId: String) = APIAuthAction.async { implicit request =>
    withModifyPermissionForCollections(Set(collectionId)) {
      val identity = request.user
      FaciaToolMetrics.DraftPublishCount.increment()
      val futureCollectionJson = faciaApiIO.publishCollectionJson(collectionId, identity)
      futureCollectionJson.flatMap {
          case Some(collectionJson) =>
            updateActions.archivePublishBlock(collectionId, collectionJson, identity)
            faciaPress.press(PressCommand.forOneId(collectionId).withPressDraft().withPressLive())
            auditingUpdates.putAudit(AuditUpdate(PublishUpdate(collectionId), identity.email))
            maybeSendBreakingAlert(request, collectionId)
          case None => Future.successful(NoCache(Ok))}}}

  private def maybeSendBreakingAlert(request: UserRequest[AnyContent], collectionId: String): Future[Result] = {
    if (configAgent.isCollectionInBreakingNewsFront(collectionId)) {
      val identity = request.user
      request.body.asJson.flatMap(_.asOpt[ClientHydratedCollection]).map {
        case clientCollection: ClientHydratedCollection => {
          auditingUpdates.putAudit(AuditUpdate(HandlingBreakingNewsUpdate(collectionId), identity.email))
          breakingNewsUpdate.putBreakingNewsUpdate(
            collectionId = collectionId,
            collection = clientCollection,
            email = identity.email
          ).map {
            result => NoCache(result)
          }
        }
        case _ => Future.successful(BadRequest)
      }.getOrElse(Future.successful(NotAcceptable))
    } else
      Future.successful(NoCache(Ok))}

  def discardCollection(collectionId: String) = APIAuthAction.async { request =>
    val identity = request.user
    val futureCollectionJson = faciaApiIO.discardCollectionJson(collectionId, identity)
    futureCollectionJson.map { maybeCollectionJson =>
      maybeCollectionJson.foreach { b =>
        updateActions.archiveDiscardBlock(collectionId, b, identity)
        faciaPress.press(PressCommand.forOneId(collectionId).withPressDraft())
        auditingUpdates.putAudit(AuditUpdate(DiscardUpdate(collectionId), identity.email))
      }
      NoCache(Ok)}}

  def treatEdits(collectionId: String) = APIAuthAction.async { request =>
    request.body.asJson.flatMap(_.asOpt[UpdateMessage]).map {
      case update: Update =>
        val identity = request.user
        updateActions.updateTreats(collectionId, update.update, identity).map(_.map{ updatedCollectionJson =>
          s3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          auditingUpdates.putAudit(AuditUpdate(update, identity.email))
          faciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
        }.getOrElse(NotFound))

      case remove: Remove =>
        val identity = request.user
        updateActions.removeTreats(collectionId, remove.remove, identity).map(_.map{ updatedCollectionJson =>
          s3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          auditingUpdates.putAudit(AuditUpdate(remove, identity.email))
          faciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
      }.getOrElse(NotFound))
      case updateAndRemove: UpdateAndRemove =>
        val identity = request.user
        val futureUpdatedCollections =
          Future.sequence(
            List(updateActions.updateTreats(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
              updateActions.removeTreats(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
            )).map(_.flatten.toMap)

        futureUpdatedCollections.map { updatedCollections =>
          val collectionIds = updatedCollections.keySet
          auditingUpdates.putAudit(AuditUpdate(updateAndRemove, identity.email))
          faciaPress.press(PressCommand(collectionIds).withPressLive())
          Ok(Json.toJson(updatedCollections)).as("application/json")
        }
      case _ => Future.successful(NotAcceptable)
    }.getOrElse(Future.successful(NotAcceptable))
  }

  def collectionEdits(): Action[AnyContent] = APIAuthAction.async { implicit request =>
    FaciaToolMetrics.ApiUsageCount.increment()
      request.body.asJson.flatMap (_.asOpt[UpdateMessage]).map {
        case update: Update =>
          withModifyPermissionForCollections(Set(update.update.id)) {
            val identity = request.user

            val futureCollectionJson = updateActions.updateCollectionList(update.update.id, update.update, identity)
            futureCollectionJson.map { maybeCollectionJson =>
              val updatedCollections = maybeCollectionJson.map(update.update.id -> _).toMap

              val shouldUpdateLive: Boolean = update.update.live

              val collectionIds = updatedCollections.keySet

              faciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.update.draft)
              )

              if (updatedCollections.nonEmpty) {
                auditingUpdates.putAudit(AuditUpdate(update, identity.email))
                Ok(Json.toJson(updatedCollections)).as("application/json")
              } else
                NotFound
            }
          }
        case remove: Remove =>
          withModifyPermissionForCollections(Set(remove.remove.id)) {
            val identity = request.user
            updateActions.updateCollectionFilter(remove.remove.id, remove.remove, identity).map { maybeCollectionJson =>
              val updatedCollections = maybeCollectionJson.map(remove.remove.id -> _).toMap
              val shouldUpdateLive: Boolean = remove.remove.live
              val collectionIds = updatedCollections.keySet
              faciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || remove.remove.draft)
              )
              auditingUpdates.putAudit(AuditUpdate(remove, identity.email))
              Ok(Json.toJson(updatedCollections)).as("application/json")
            }
          }
        case updateAndRemove: UpdateAndRemove =>
          withModifyPermissionForCollections(Set(updateAndRemove.update.id, updateAndRemove.remove.id)) {
            val identity = request.user
            val futureUpdatedCollections =
              Future.sequence(
                List(updateActions.updateCollectionList(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
                  updateActions.updateCollectionFilter(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
                )).map(_.flatten.toMap)

            futureUpdatedCollections.map { updatedCollections =>

              val shouldUpdateLive: Boolean = updateAndRemove.remove.live || updateAndRemove.update.live
              val shouldUpdateDraft: Boolean = updateAndRemove.remove.draft || updateAndRemove.update.draft
              val collectionIds = updatedCollections.keySet
              faciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || shouldUpdateDraft)
              )
              auditingUpdates.putAudit(AuditUpdate(updateAndRemove, identity.email))
              Ok(Json.toJson(updatedCollections)).as("application/json")
            }
          }
        case _ => Future.successful(NotAcceptable)
      } getOrElse Future.successful(NotFound)
  }

  def pressLivePath(path: String) = APIAuthAction { request =>
    faciaPressQueue.enqueue(PressJob(FrontPath(path), Live, forceConfigUpdate = Option(true)))
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = APIAuthAction { request =>
    faciaPressQueue.enqueue(PressJob(FrontPath(path), Draft, forceConfigUpdate = Option(true)))
    NoCache(Ok)
  }

  def getMetadata() = APIAuthAction { request =>
    val matchingTags = request.queryString.get("query") match {
      case Some(Seq(search)) if search.nonEmpty => Metadata.tags.filterKeys(_ contains search)
      case _ => Metadata.tags
    }
    Ok(Json.toJson(matchingTags.map{
      case (_, meta) => meta
    }))
  }
}
