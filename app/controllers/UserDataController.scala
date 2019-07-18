package controllers

import com.gu.facia.client.models.Trail
import com.gu.scanamo._
import com.gu.scanamo.syntax._
import services.{Dynamo, FrontsApi}
import model.{FeatureSwitch, FeatureSwitches, UserData}
import play.api.Logger
import play.api.libs.json.JsValue

import scala.concurrent.{ExecutionContext, Future}

class UserDataController(frontsApi: FrontsApi, dynamo: Dynamo, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {
  import model.UserData._

  private lazy val userDataTable = Table[UserData](config.faciatool.userDataTable)

  private def updateClipboardContentByFieldName(articles: Option[JsValue], userEmail: String, fieldName: String) = {
    val clipboardArticles: Option[List[Trail]] = articles.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardArticles match {
      case Some(articles) => {
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> userEmail, set(Symbol(fieldName) -> articles)))
        Ok
      }
      case None => BadRequest
    }

  }


  def putClipboardContent() = APIAuthAction { request =>

    updateClipboardContentByFieldName(request.body.asJson, request.user.email, "clipboardArticles")

  }

  def putEditionsClipboardContent() = APIAuthAction { request =>

    updateClipboardContentByFieldName(request.body.asJson, request.user.email, "editionsClipboardArticles")

  }

  def putFrontIds() = APIAuthAction { request =>
    val maybeFrontIds: Option[List[String]] = request.body.asJson.flatMap(
      _.asOpt[List[String]])
    maybeFrontIds match {
      case Some(frontIds) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('frontIds -> frontIds)))
        Ok
      case _ => BadRequest
    }
  }

  def putFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFrontIdsByPriority match {
      case Some(frontIdsByPriority) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('frontIdsByPriority -> frontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFavouriteFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFavouriteFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFavouriteFrontIdsByPriority match {
      case Some(favouriteFrontIdsByPriority) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('favouriteFrontIdsByPriority -> favouriteFrontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def migrateUserData() = AccessAPIAuthAction.async {
    val result = frontsApi.amazonClient.config.flatMap { config =>
      val maybeUserData = Scanamo.exec(dynamo.client)(userDataTable.scan)
      Future.successful(maybeUserData.filter(_.isRight).map {
        case Right(userData) =>
          val frontIds = userData.frontIds.getOrElse(List.empty[String])
          val frontIdsByPriority = frontIds.foldLeft(Map.empty[String, List[String]])((acc, frontId) => {
            val maybeAcc = for {
              front <- config.fronts.get(frontId)
            } yield {
              val priority = front.priority.getOrElse("editorial")
              val frontIdsByCurrentPriority = acc.getOrElse(priority, List.empty[String])
              acc + (priority -> (frontIdsByCurrentPriority :+ frontId))
            }
            maybeAcc.getOrElse(acc)
          })
          Scanamo.exec(dynamo.client)(userDataTable.update('email -> userData.email, set('frontIdsByPriority -> frontIdsByPriority)))
          Map(userData.email -> frontIdsByPriority)
      })
    }
    result.map(data => {
      Ok
    })
  }

  def putFeatureSwitch() = APIAuthAction { request =>
    val maybeFeatureSwitch: Option[FeatureSwitch] = request.body.asJson.flatMap(
      _.asOpt[FeatureSwitch])
    val maybeUserData: Option[UserData] = Scanamo.exec(dynamo.client)(
      userDataTable.get('email -> request.user.email)).flatMap(_.right.toOption)

    (maybeUserData, maybeFeatureSwitch) match {
      case (Some(userData), Some(featureSwitch)) =>
        if (FeatureSwitches.all.map(_.key).contains(featureSwitch.key)) {
          val featureSwitches = userData.featureSwitches.getOrElse(List.empty).map { switch => {
            if (switch.key != featureSwitch.key) { switch } else { featureSwitch }
          }}
          Scanamo.exec(dynamo.client)(userDataTable.update(
            'email -> request.user.email,
            set('featureSwitches -> featureSwitches)))
          Ok
        } else {
          BadRequest(s"Feature with key ${featureSwitch.key} not found")
        }
      case _ => BadRequest
    }
  }
}


