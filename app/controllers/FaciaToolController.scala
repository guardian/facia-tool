package controllers

import akka.actor.ActorSystem
import auth.PanDomainAuthActions
import com.gu.pandomainauth.action.UserRequest
import frontsapi.model._
import metrics.FaciaToolMetrics
import model.{Cached, NoCache}
import permissions.{BreakingNewsEditCollectionsCheck, ConfigPermissionCheck}
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import services._
import tools.FaciaApiIO
import updates._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object FaciaToolController extends Controller with PanDomainAuthActions with BreakingNewsEditCollectionsCheck {

  override lazy val actorSystem = ActorSystem()

  def priorities() = AuthAction { request =>
    Logger.info("Doing priorities..." + request)
    val identity = request.user
    Cached(60) { Ok(views.html.priority(Option(identity))) }
  }

  def collectionEditor() = AuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.admin_main(Option(identity))) }
  }

  def configEditor() = (AuthAction andThen ConfigPermissionCheck) { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.admin_main(Option(identity))) }
  }

  def listCollections = APIAuthAction { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache { Ok(Json.toJson(S3FrontsApi.listCollectionIds)) }
  }

  def getConfig = APIAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    FrontsApi.amazonClient.config.map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")}}}

  def getCollection(collectionId: String) = APIAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    FrontsApi.amazonClient.collection(collectionId).map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")}}}

  def publishCollection(collectionId: String) = APIAuthAction.async { implicit request =>
    withModifyPermissionForCollections(Set(collectionId)) {
      val identity = request.user
      FaciaToolMetrics.DraftPublishCount.increment()
      val futureCollectionJson = FaciaApiIO.publishCollectionJson(collectionId, identity)
      futureCollectionJson.flatMap {
          case Some(collectionJson) =>
            UpdateActions.archivePublishBlock(collectionId, collectionJson, identity)
            FaciaPress.press(PressCommand.forOneId(collectionId).withPressDraft().withPressLive())
            UpdatesStream.putStreamUpdate(StreamUpdate(PublishUpdate(collectionId), identity.email))
            maybeSendBreakingAlert(request, collectionId)
          case None => Future.successful(NoCache(Ok))}}}

  private def maybeSendBreakingAlert(request: UserRequest[AnyContent], collectionId: String): Future[Result] = {
    if (ConfigAgent.isCollectionInBreakingNewsFront(collectionId)) {
      val identity = request.user
      request.body.asJson.flatMap(_.asOpt[ClientHydratedCollection]).map {
        case clientCollection: ClientHydratedCollection =>
          BreakingNewsUpdate.putBreakingNewsUpdate(
            collectionId = collectionId,
            collection = clientCollection,
            email = identity.email
          ).map {
            result => NoCache(result)
          }
        case _ => Future.successful(BadRequest)
      }.getOrElse(Future.successful(NotAcceptable))
    } else
      Future.successful(NoCache(Ok))}

  def discardCollection(collectionId: String) = APIAuthAction.async { request =>
    val identity = request.user
    val futureCollectionJson = FaciaApiIO.discardCollectionJson(collectionId, identity)
    futureCollectionJson.map { maybeCollectionJson =>
      maybeCollectionJson.foreach { b =>
        UpdateActions.archiveDiscardBlock(collectionId, b, identity)
        FaciaPress.press(PressCommand.forOneId(collectionId).withPressDraft())
        UpdatesStream.putStreamUpdate(StreamUpdate(DiscardUpdate(collectionId), identity.email))
      }
      NoCache(Ok)}}

  def treatEdits(collectionId: String) = APIAuthAction.async { request =>
    request.body.asJson.flatMap(_.asOpt[UpdateMessage]).map {
      case update: Update =>
        val identity = request.user
        UpdateActions.updateTreats(collectionId, update.update, identity).map(_.map{ updatedCollectionJson =>
          S3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          UpdatesStream.putStreamUpdate(StreamUpdate(update, identity.email))
          FaciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
        }.getOrElse(NotFound))

      case remove: Remove =>
        val identity = request.user
        UpdateActions.removeTreats(collectionId, remove.remove, identity).map(_.map{ updatedCollectionJson =>
          S3FrontsApi.putCollectionJson(collectionId, Json.prettyPrint(Json.toJson(updatedCollectionJson)))
          UpdatesStream.putStreamUpdate(StreamUpdate(remove, identity.email))
          FaciaPress.press(PressCommand.forOneId(collectionId).withPressLive())
          Ok(Json.toJson(Map(collectionId -> updatedCollectionJson))).as("application/json")
      }.getOrElse(NotFound))
      case updateAndRemove: UpdateAndRemove =>
        val identity = request.user
        val futureUpdatedCollections =
          Future.sequence(
            List(UpdateActions.updateTreats(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
              UpdateActions.removeTreats(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
            )).map(_.flatten.toMap)

        futureUpdatedCollections.map { updatedCollections =>
          val collectionIds = updatedCollections.keySet
          UpdatesStream.putStreamUpdate(StreamUpdate(updateAndRemove, identity.email))
          FaciaPress.press(PressCommand(collectionIds).withPressLive())
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

            val futureCollectionJson = UpdateActions.updateCollectionList(update.update.id, update.update, identity)
            futureCollectionJson.map { maybeCollectionJson =>
              val updatedCollections = maybeCollectionJson.map(update.update.id -> _).toMap

              val shouldUpdateLive: Boolean = update.update.live

              val collectionIds = updatedCollections.keySet

              FaciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.update.draft)
              )

              if (updatedCollections.nonEmpty) {
                UpdatesStream.putStreamUpdate(StreamUpdate(update, identity.email))
                Ok(Json.toJson(updatedCollections)).as("application/json")
              } else
                NotFound
            }
          }
        case remove: Remove =>
          withModifyPermissionForCollections(Set(remove.remove.id)) {
            val identity = request.user
            UpdateActions.updateCollectionFilter(remove.remove.id, remove.remove, identity).map { maybeCollectionJson =>
              val updatedCollections = maybeCollectionJson.map(remove.remove.id -> _).toMap
              val shouldUpdateLive: Boolean = remove.remove.live
              val collectionIds = updatedCollections.keySet
              FaciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || remove.remove.draft)
              )
              UpdatesStream.putStreamUpdate(StreamUpdate(remove, identity.email))
              Ok(Json.toJson(updatedCollections)).as("application/json")
            }
          }
        case updateAndRemove: UpdateAndRemove =>
          withModifyPermissionForCollections(Set(updateAndRemove.update.id, updateAndRemove.remove.id)) {
            val identity = request.user
            val futureUpdatedCollections =
              Future.sequence(
                List(UpdateActions.updateCollectionList(updateAndRemove.update.id, updateAndRemove.update, identity).map(_.map(updateAndRemove.update.id -> _)),
                  UpdateActions.updateCollectionFilter(updateAndRemove.remove.id, updateAndRemove.remove, identity).map(_.map(updateAndRemove.remove.id -> _))
                )).map(_.flatten.toMap)

            futureUpdatedCollections.map { updatedCollections =>

              val shouldUpdateLive: Boolean = updateAndRemove.remove.live || updateAndRemove.update.live
              val shouldUpdateDraft: Boolean = updateAndRemove.remove.draft || updateAndRemove.update.draft
              val collectionIds = updatedCollections.keySet
              FaciaPress.press(PressCommand(
                collectionIds,
                live = shouldUpdateLive,
                draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || shouldUpdateDraft)
              )
              UpdatesStream.putStreamUpdate(StreamUpdate(updateAndRemove, identity.email))
              Ok(Json.toJson(updatedCollections)).as("application/json")
            }
          }
        case _ => Future.successful(NotAcceptable)
      } getOrElse Future.successful(NotFound)
  }

  def pressLivePath(path: String) = APIAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live, forceConfigUpdate = Option(true)))
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = APIAuthAction { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft, forceConfigUpdate = Option(true)))
    NoCache(Ok)
  }

  def getLastModified(path: String) = APIAuthAction { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }

}
