package controllers

import frontsapi.model.UpdateActions
import logging.Logging
import metrics.FaciaToolMetrics
import model.NoCache
import play.api.libs.json.Json
import services._
import updates._
import util.Acl
import permissions.ModifyCollectionsPermissionsCheck
import play.api.mvc.{Action, AnyContent}

import scala.concurrent.{ExecutionContext, Future}


class FaciaToolV2Controller(
                           val acl: Acl,
                           val structuredLogger: StructuredLogger,
                           val faciaPress: FaciaPress,
                           val updateActions: UpdateActions,
                           val configAgent: ConfigAgent,
                           val collectionService: CollectionService,
                           val deps: BaseFaciaControllerComponents
                         )(implicit ec: ExecutionContext)
  extends BaseFaciaController(deps) with ModifyCollectionsPermissionsCheck with Logging {

  def getCollections(): Action[AnyContent] = AccessAPIAuthAction.async { implicit request =>
    val collectionIds = request.queryString.getOrElse("ids", Seq()).toList
    val collectionPriorities = collectionIds.flatMap(configAgent.getFrontsPermissionsPriorityByCollectionId(_)).toSet

    withModifyGroupPermissionForCollections(collectionPriorities, Set()) {
      val collections = collectionService.fetchCollectionsAndStoriesVisible(collectionIds)

      collections.map(c => NoCache {
        Ok(Json.toJson(c)).as("application/json")
      })
    }
  }

  def collectionEdits() = AccessAPIAuthAction.async { implicit request =>

    FaciaToolMetrics.ApiUsageCount.increment()

    val v2Update: Option[V2Update] = request.body.asJson.flatMap(jsValue => jsValue.asOpt[V2Update])
    v2Update match {
      case Some(update) => {

        val collectionPriorities = configAgent.getFrontsPermissionsPriorityByCollectionId(update.id)

        withModifyGroupPermissionForCollections(collectionPriorities, Set()) {

          val identity = request.user

          updateActions.v2UpdateCollection(update.id, update.collection, identity)

          faciaPress.press(PressCommand(
            Set(update.id),
            live = false,
            draft = true
          ))

          structuredLogger.putLog(LogUpdate(V2CollectionUpdate(update.id, update.collection), identity.email))

          Future.successful(Ok(Json.toJson(update.collection)).as("application/json"))
        }

      }
      case None => Future.successful(BadRequest)
    }

  }
}

