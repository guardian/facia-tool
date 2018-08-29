package controllers

import com.gu.scanamo.Table
import frontsapi.model.UpdateActions
import logging.Logging
import metrics.FaciaToolMetrics
import model.UserData
import play.api.libs.json.Json
import services._
import updates._
import util.Acl

import scala.concurrent.ExecutionContext


class FaciaToolV2Controller(
                           val acl: Acl,
                           val structuredLogger: StructuredLogger,
                           val faciaPress: FaciaPress,
                           val updateActions: UpdateActions,
                           val deps: BaseFaciaControllerComponents
                         )(implicit ec: ExecutionContext)
  extends BaseFaciaController(deps) with Logging {

  def collectionEdits() = AccessAPIAuthAction { implicit request =>


    FaciaToolMetrics.ApiUsageCount.increment()

    val v2Update: Option[V2Update] = request.body.asJson.flatMap(jsValue => jsValue.asOpt[V2Update])
    v2Update match {
      case Some(update) => {
          val identity = request.user

          updateActions.v2UpdateCollection(update.id, update.collection, identity)

          faciaPress.press(PressCommand(
            Set(update.id),
            live = false,
            draft = true
          ))

          structuredLogger.putLog(LogUpdate(V2CollectionUpdate(update.id, update.collection), identity.email))

          Ok(Json.toJson(update.collection)).as("application/json")

      }
      case None => BadRequest
    }

  }
}

