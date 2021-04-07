package controllers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.gu.facia.client.models.Trail
import org.scanamo._
import org.scanamo.syntax._

import model.{FeatureSwitch, FeatureSwitches, UserData}
import services.{FrontsApi}
import model.{UserData}

import play.api.Logger
import play.api.libs.json.JsValue
import services.FrontsApi

import scala.concurrent.{ExecutionContext, Future}

class UserDataController(frontsApi: FrontsApi, dynamoClient: AmazonDynamoDB, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {
  import model.UserData._

  private lazy val userDataTable = Table[UserData](config.faciatool.userDataTable)

  private def updateClipboardContentByFieldName(articles: Option[JsValue], userEmail: String, fieldName: String) = {
    val clipboardArticles: Option[List[Trail]] = articles.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardArticles match {
      case Some(articles) => {

        Scanamo.exec(dynamoClient)(userDataTable.update('email -> userEmail, set(Symbol(fieldName) -> articles)))
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
        Scanamo.exec(dynamoClient)(userDataTable.update('email -> request.user.email, set('frontIds -> frontIds)))
        Ok
      case _ => BadRequest
    }
  }

  def putFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFrontIdsByPriority match {
      case Some(frontIdsByPriority) =>
        Scanamo.exec(dynamoClient)(userDataTable.update('email -> request.user.email, set('frontIdsByPriority -> frontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFavouriteFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFavouriteFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFavouriteFrontIdsByPriority match {
      case Some(favouriteFrontIdsByPriority) =>
        Scanamo.exec(dynamoClient)(userDataTable.update('email -> request.user.email, set('favouriteFrontIdsByPriority -> favouriteFrontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFeatureSwitch() = APIAuthAction { request =>
    val maybeFeatureSwitch: Option[FeatureSwitch] = request.body.asJson.flatMap(
      _.asOpt[FeatureSwitch])
    val maybeUserData: Option[UserData] = Scanamo.exec(dynamoClient)(
      userDataTable.get('email -> request.user.email)).flatMap(_.right.toOption)

    (maybeUserData, maybeFeatureSwitch) match {
      case (Some(userData), Some(featureSwitch)) =>
        if (FeatureSwitches.all.map(_.key).contains(featureSwitch.key)) {
          val updatedSwitches = FeatureSwitches.updateFeatureSwitchesForUser(userData.featureSwitches, featureSwitch)
          Scanamo.exec(dynamoClient)(userDataTable.update(
            'email -> request.user.email,
            set('featureSwitches -> updatedSwitches)))
          Ok
        } else {
          BadRequest(s"Feature with key ${featureSwitch.key} not found")
        }
      case _ => BadRequest
    }
  }
}


