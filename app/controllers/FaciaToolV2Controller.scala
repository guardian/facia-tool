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
import org.joda.time.{DateTime}
import play.api.mvc.{Action, AnyContent}

import scala.concurrent.{ExecutionContext, Future}


object GetCollectionRequest {
  implicit val jsonFormat = Json.format[GetCollectionRequest]
}

case class GetCollectionRequest(
                                 collectionSpecs: Seq[CollectionSpec]
                               )

case class CollectionSpec(id: String, `type`: String, lastUpdated: Option[Int])

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

  def getCollections() = AccessAPIAuthAction(parse.json[GetCollectionRequest]).async { implicit request =>

    val collectionSpecs = request.body.collectionSpecs.toList
    val collectionIds = collectionSpecs.map(_.id)

    val collectionPriorities = collectionIds.flatMap(configAgent.getFrontsPermissionsPriorityByCollectionId(_)).toSet


    //TODO write tests

    withModifyGroupPermissionForCollections(collectionPriorities, Set()) {
      val collections = collectionService.fetchCollectionsAndStoriesVisible(collectionIds)

      // if spec includes lastUpdated timestamp, then this will only return the server data if it is more recent than the spec timestamp
      def getNewerServerData(collectionAndStoriesResponse: CollectionAndStoriesResponse) = {
        val id = collectionAndStoriesResponse.id
        val lastUpdated = collectionAndStoriesResponse.collection.lastUpdated
        val spec = collectionSpecs.find(spec => spec.id == id)

        // .getOrElse ensures that if lastUpdated does not exist, it will always be less, and the server data will always be returned.
        spec.flatMap(s => if (s.lastUpdated.getOrElse(-1) < lastUpdated.getMillis()) Some(collectionAndStoriesResponse) else None)
      }
      collections.map(c =>
        c.map(_.flatMap(response => getNewerServerData(response)))).map(c =>
        NoCache {
          Ok(Json.toJson(c)).as("application/json")
        })

//      collections.map(c => NoCache {
//        c.map(collectionAndStoriesResponse => collectionAndStoriesResponse match {
//          case Some(response) => getNewerServerData(response)
//          case None => None
//        })
//        Ok(Json.toJson(c)).as("application/json")
//      })
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

