package controllers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.gu.facia.client.models.{Trail, TrailMetaData}
import org.scanamo._
import org.scanamo.syntax._
import model.{FeatureSwitch, FeatureSwitches, UserData}
import services.FrontsApi
import model.UserData
import org.scanamo.generic.auto.genericDerivedFormat
import org.scanamo.query.UniqueKey
import play.api.Logger
import play.api.libs.json.{JsArray, JsValue, Json}
import services.FrontsApi
import software.amazon.awssdk.services.dynamodb.DynamoDbClient

import scala.concurrent.{ExecutionContext, Future}
import org.scanamo.generic.semiauto._

import scala.util.{Failure, Success, Try}

class UserDataController(frontsApi: FrontsApi, dynamoClient: DynamoDbClient, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {
  implicit val UserData: DynamoFormat[UserData] = deriveDynamoFormat[UserData]
  implicit val Trail: DynamoFormat[Trail] = deriveDynamoFormat[Trail]
  implicit val JsValue: DynamoFormat[JsValue] = DynamoFormat.xmap[JsValue, String](
    x => Try(Json.parse(x)) match {
      case Success(y) => Right(y)
      case Failure(t) => Left(TypeCoercionError(t))
    },
    x => (Json.stringify(x))
  )

  private lazy val userDataTable = Table[UserData](config.faciatool.userDataTable)

  private def updateClipboardContentByFieldName(articles: Option[JsValue], userEmail: String, fieldName: String) = {
    val clipboardArticles: Option[List[Trail]] = articles.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardArticles match {
      case Some(articles) => {

        Scanamo(dynamoClient).exec(userDataTable.update(UniqueKey("email" === userEmail), set(fieldName, articles)))
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
        Scanamo(dynamoClient).exec(userDataTable.update("email" === request.user.email, set("frontIds", frontIds)))
        Ok
      case _ => BadRequest
    }
  }

  def putFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFrontIdsByPriority match {
      case Some(frontIdsByPriority) =>
        Scanamo(dynamoClient).exec(userDataTable.update("email" === request.user.email, set("frontIdsByPriority", frontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFavouriteFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFavouriteFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFavouriteFrontIdsByPriority match {
      case Some(favouriteFrontIdsByPriority) =>
        Scanamo(dynamoClient).exec(userDataTable.update("email" === request.user.email, set("favouriteFrontIdsByPriority", favouriteFrontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFeatureSwitch() = APIAuthAction { request =>
    val maybeFeatureSwitch: Option[FeatureSwitch] = request.body.asJson.flatMap(
      _.asOpt[FeatureSwitch])
    val maybeUserData: Option[UserData] = Scanamo(dynamoClient).exec(
      userDataTable.get("email" === request.user.email)).flatMap(_.toOption)

    (maybeUserData, maybeFeatureSwitch) match {
      case (Some(userData), Some(featureSwitch)) =>
        if (FeatureSwitches.all.map(_.key).contains(featureSwitch.key)) {
          val updatedSwitches = FeatureSwitches.updateFeatureSwitchesForUser(userData.featureSwitches, featureSwitch)
          Scanamo(dynamoClient).exec(userDataTable.update(
            "email" === request.user.email,
            set("featureSwitches", updatedSwitches)))
          Ok
        } else {
          BadRequest(s"Feature with key ${featureSwitch.key} not found")
        }
      case _ => BadRequest
    }
  }
}


