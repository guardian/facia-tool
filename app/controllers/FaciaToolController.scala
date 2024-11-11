package controllers

import _root_.util.Acl
import com.gu.facia.client.models.{CollectionJson}
import com.gu.facia.api.models.faciapress.{Draft, FrontPath, Live, PressJob}
import com.gu.facia.client.models.Metadata
import com.gu.pandomainauth.action.UserRequest
import frontsapi.model._
import metrics.FaciaToolMetrics
import model.NoCache
import permissions._
import play.api.libs.json._
import play.api.mvc._
import services._
import tools.FaciaApiIO
import updates._
import logging.Logging

import scala.concurrent.{ExecutionContext, Future}
import permissions.CollectionPermissions

class FaciaToolController(
    val acl: Acl,
    val frontsApi: FrontsApi,
    val collectionService: CollectionService,
    val faciaApiIO: FaciaApiIO,
    val updateActions: UpdateActions,
    breakingNewsUpdate: BreakingNewsUpdate,
    val structuredLogger: StructuredLogger,
    val faciaPress: FaciaPress,
    val faciaPressTopic: FaciaPressTopic,
    val configAgent: ConfigAgent,
    val s3FrontsApi: S3FrontsApi,
    val deps: BaseFaciaControllerComponents
)(implicit
    ec: ExecutionContext
) extends BaseFaciaController(deps)
    with BreakingNewsEditCollectionsCheck
    with ModifyCollectionsPermissionsCheck
    with Logging {

  private val collectionPermissions = CollectionPermissions(configAgent.get)

  def getConfig = AccessAPIAuthAction.async { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    frontsApi.amazonClient.config.map { configJson =>
      NoCache {
        Ok(Json.toJson(configJson)).as("application/json")
      }
    }
  }

  def getCollection(collectionId: String): Action[AnyContent] =
    AccessAPIAuthAction.async { implicit request =>
      val collectionPriorities =
        collectionPermissions.getFrontsPermissionsPriorityByCollectionId(
          collectionId
        )

      withModifyGroupPermissionForCollections(collectionPriorities, Set()) {
        val collectionsFuture = collectionService.fetchCollection(collectionId)

        collectionsFuture.map { collection =>
          collection
            .map { collection =>
              NoCache {
                Ok(Json.toJson(collection)).as("application/json")
              }
            }
            .getOrElse(Results.NotFound)
        }
      }
    }

  def publishCollection(collectionId: String) = AccessAPIAuthAction.async {
    implicit request =>
      withModifyPermissionForCollections(Set(collectionId)) {

        val collectionPriorities =
          collectionPermissions.getFrontsPermissionsPriorityByCollectionId(
            collectionId
          )

        withModifyGroupPermissionForCollections(
          collectionPriorities,
          Set(),
          true
        ) {
          val identity = request.user
          FaciaToolMetrics.DraftPublishCount.increment()
          val futureCollectionJson =
            faciaApiIO.publishCollectionJson(collectionId, identity)
          futureCollectionJson.flatMap {
            case Some(collectionJson) =>
              updateActions.archivePublishBlock(
                collectionId,
                collectionJson,
                identity
              )
              faciaPress.press(
                PressCommand
                  .forOneId(collectionId)
                  .withPressDraft()
                  .withPressLive()
              )
              structuredLogger.putLog(
                LogUpdate(PublishUpdate(collectionId), identity.email)
              )
              maybeSendBreakingAlert(request, collectionId)
            case None => Future.successful(NoCache(Ok))
          }
        }
      }
  }

  private def maybeSendBreakingAlert(
      request: UserRequest[AnyContent],
      collectionId: String
  ): Future[Result] = {
    if (configAgent.isCollectionInBreakingNewsFront(collectionId)) {
      val identity = request.user
      request.body.asJson
        .flatMap(_.asOpt[ClientHydratedCollection])
        .map {
          case clientCollection: ClientHydratedCollection => {
            structuredLogger.putLog(
              LogUpdate(
                HandlingBreakingNewsUpdate(collectionId),
                identity.email
              )
            )
            breakingNewsUpdate
              .putBreakingNewsUpdate(
                collectionId = collectionId,
                collection = clientCollection,
                email = identity.email
              )
              .map { result =>
                NoCache(result)
              }
          }
          case _ => Future.successful(BadRequest)
        }
        .getOrElse(Future.successful(NotAcceptable))
    } else
      Future.successful(NoCache(Ok))
  }

  def discardCollection(collectionId: String) = AccessAPIAuthAction.async {
    request =>
      val identity = request.user
      val futureCollectionJson =
        faciaApiIO.discardCollectionJson(collectionId, identity)
      futureCollectionJson.map { maybeCollectionJson =>
        maybeCollectionJson.foreach { b =>
          updateActions.archiveDiscardBlock(collectionId, b, identity)
          faciaPress.press(PressCommand.forOneId(collectionId).withPressDraft())
          structuredLogger.putLog(
            LogUpdate(DiscardUpdate(collectionId), identity.email)
          )
        }
        NoCache(Ok)
      }
  }

  def treatEdits(collectionId: String) = AccessAPIAuthAction.async {
    implicit request =>
      val collectionPriorities =
        collectionPermissions.getFrontsPermissionsPriorityByCollectionId(
          collectionId
        )

      withModifyGroupPermissionForCollections(collectionPriorities, Set()) {

        request.body.asJson
          .flatMap(_.asOpt[UpdateMessage])
          .map {
            case update: Update =>
              val identity = request.user
              updateActions
                .updateTreats(collectionId, update.update, identity)
                .map(_.map { updatedCollectionJson =>
                  s3FrontsApi.putCollectionJson(
                    collectionId,
                    Json.prettyPrint(Json.toJson(updatedCollectionJson))
                  )
                  structuredLogger.putLog(LogUpdate(update, identity.email))
                  faciaPress
                    .press(PressCommand.forOneId(collectionId).withPressLive())
                  Ok(Json.toJson(Map(collectionId -> updatedCollectionJson)))
                    .as("application/json")
                }.getOrElse(NotFound))

            case remove: Remove =>
              val identity = request.user
              updateActions
                .removeTreats(collectionId, remove.remove, identity)
                .map(_.map { updatedCollectionJson =>
                  s3FrontsApi.putCollectionJson(
                    collectionId,
                    Json.prettyPrint(Json.toJson(updatedCollectionJson))
                  )
                  structuredLogger.putLog(LogUpdate(remove, identity.email))
                  faciaPress
                    .press(PressCommand.forOneId(collectionId).withPressLive())
                  Ok(Json.toJson(Map(collectionId -> updatedCollectionJson)))
                    .as("application/json")
                }.getOrElse(NotFound))
            case updateAndRemove: UpdateAndRemove =>
              val identity = request.user
              val futureUpdatedCollections =
                Future
                  .sequence(
                    List(
                      updateActions
                        .updateTreats(
                          updateAndRemove.update.id,
                          updateAndRemove.update,
                          identity
                        )
                        .map(_.map(updateAndRemove.update.id -> _)),
                      updateActions
                        .removeTreats(
                          updateAndRemove.remove.id,
                          updateAndRemove.remove,
                          identity
                        )
                        .map(_.map(updateAndRemove.remove.id -> _))
                    )
                  )
                  .map(_.flatten.toMap)

              futureUpdatedCollections.map { updatedCollections =>
                val collectionIds = updatedCollections.keySet
                structuredLogger.putLog(
                  LogUpdate(updateAndRemove, identity.email)
                )
                faciaPress.press(PressCommand(collectionIds).withPressLive())
                Ok(Json.toJson(updatedCollections)).as("application/json")
              }
            case _ => Future.successful(NotAcceptable)
          }
          .getOrElse(Future.successful(NotAcceptable))
      }
  }

  def collectionEdits(): Action[AnyContent] = AccessAPIAuthAction.async {
    implicit request =>
      FaciaToolMetrics.ApiUsageCount.increment()
      request.body.asJson.flatMap(_.asOpt[UpdateMessage]).map {
        case update: Update =>
          withModifyPermissionForCollections(Set(update.update.id)) {

            val collectionPriorities = collectionPermissions
              .getFrontsPermissionsPriorityByCollectionId(update.update.id)

            withModifyGroupPermissionForCollections(
              collectionPriorities,
              Set()
            ) {

              val identity = request.user

              val futureCollectionJson = updateActions
                .updateCollectionList(update.update.id, update.update, identity)
              futureCollectionJson.map { maybeCollectionJson =>
                val updatedCollections =
                  maybeCollectionJson.map(update.update.id -> _).toMap

                val shouldUpdateLive: Boolean = update.update.live

                val collectionIds = updatedCollections.keySet

                faciaPress.press(
                  PressCommand(
                    collectionIds,
                    live = shouldUpdateLive,
                    draft = (updatedCollections.values.exists(
                      _.draft.isEmpty
                    ) && shouldUpdateLive) || update.update.draft
                  )
                )

                if (updatedCollections.nonEmpty) {
                  structuredLogger.putLog(LogUpdate(update, identity.email))
                  Ok(Json.toJson(updatedCollections)).as("application/json")
                } else
                  NotFound
              }
            }
          }
        case remove: Remove =>
          withModifyPermissionForCollections(Set(remove.remove.id)) {

            val collectionPriorities = collectionPermissions
              .getFrontsPermissionsPriorityByCollectionId(remove.remove.id)

            withModifyGroupPermissionForCollections(
              collectionPriorities,
              Set()
            ) {

              val identity = request.user
              updateActions
                .updateCollectionFilter(
                  remove.remove.id,
                  remove.remove,
                  identity
                )
                .map { maybeCollectionJson =>
                  val updatedCollections =
                    maybeCollectionJson.map(remove.remove.id -> _).toMap
                  val shouldUpdateLive: Boolean = remove.remove.live
                  val collectionIds = updatedCollections.keySet
                  faciaPress.press(
                    PressCommand(
                      collectionIds,
                      live = shouldUpdateLive,
                      draft = (updatedCollections.values.exists(
                        _.draft.isEmpty
                      ) && shouldUpdateLive) || remove.remove.draft
                    )
                  )
                  structuredLogger.putLog(LogUpdate(remove, identity.email))
                  Ok(Json.toJson(updatedCollections)).as("application/json")
                }
            }
          }
        case updateAndRemove: UpdateAndRemove =>
          withModifyPermissionForCollections(
            Set(updateAndRemove.update.id, updateAndRemove.remove.id)
          ) {

            val fromCollectionPriorities =
              collectionPermissions.getFrontsPermissionsPriorityByCollectionId(
                updateAndRemove.update.id
              )
            val toCollectionPriorities =
              collectionPermissions.getFrontsPermissionsPriorityByCollectionId(
                updateAndRemove.remove.id
              )

            withModifyGroupPermissionForCollections(
              fromCollectionPriorities,
              toCollectionPriorities
            ) {
              val identity = request.user
              val futureUpdatedCollections =
                Future
                  .sequence(
                    List(
                      updateActions
                        .updateCollectionList(
                          updateAndRemove.update.id,
                          updateAndRemove.update,
                          identity
                        )
                        .map(_.map(updateAndRemove.update.id -> _)),
                      updateActions
                        .updateCollectionFilter(
                          updateAndRemove.remove.id,
                          updateAndRemove.remove,
                          identity
                        )
                        .map(_.map(updateAndRemove.remove.id -> _))
                    )
                  )
                  .map(_.flatten.toMap)

              futureUpdatedCollections.map { updatedCollections =>
                val shouldUpdateLive: Boolean =
                  updateAndRemove.remove.live || updateAndRemove.update.live
                val shouldUpdateDraft: Boolean =
                  updateAndRemove.remove.draft || updateAndRemove.update.draft
                val collectionIds = updatedCollections.keySet
                faciaPress.press(
                  PressCommand(
                    collectionIds,
                    live = shouldUpdateLive,
                    draft = (updatedCollections.values.exists(
                      _.draft.isEmpty
                    ) && shouldUpdateLive) || shouldUpdateDraft
                  )
                )
                structuredLogger
                  .putLog(LogUpdate(updateAndRemove, identity.email))
                Ok(Json.toJson(updatedCollections)).as("application/json")
              }
            }
          }
        case _ => Future.successful(NotAcceptable)
      } getOrElse Future.successful(NotFound)
  }

  def pressLivePath(path: String) = AccessAPIAuthAction { request =>
    faciaPressTopic.publish(
      PressJob(FrontPath(path), Live, forceConfigUpdate = Option(true))
    )
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = AccessAPIAuthAction { request =>
    faciaPressTopic.publish(
      PressJob(FrontPath(path), Draft, forceConfigUpdate = Option(true))
    )
    NoCache(Ok)
  }

  def getMetadata() = AccessAPIAuthAction { request =>
    val matchingTags = request.queryString.get("query") match {
      case Some(Seq(search)) if search.nonEmpty =>
        Metadata.tags.view.filterKeys(_ contains search)
      case _ => Metadata.tags
    }
    Ok(Json.toJson(matchingTags.map { case (_, meta) =>
      meta
    }))
  }
}
