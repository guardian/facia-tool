package controllers

import com.gu.facia.client.models.Trail
import model.editions.CardType
import model.editions.client.EditionsClientCard
import org.scanamo._
import org.scanamo.syntax._
import model.{FeatureSwitch, FeatureSwitches, UserData}
import org.scanamo.generic.auto.genericDerivedFormat
import org.scanamo.query.UniqueKey
import play.api.libs.json.{
  JsError,
  JsResult,
  JsSuccess,
  JsValue,
  Json,
  JsonValidationError,
  Reads
}
import services.FrontsApi
import software.amazon.awssdk.services.dynamodb.DynamoDbClient

import scala.concurrent.ExecutionContext
import org.scanamo.generic.semiauto._

import scala.util.{Failure, Success, Try}

class UserDataController(
    frontsApi: FrontsApi,
    dynamoClient: DynamoDbClient,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps) {
  implicit val jsValue: DynamoFormat[JsValue] =
    DynamoFormat.xmap[JsValue, String](
      x =>
        Try(Json.parse(x)) match {
          case Success(y) => Right(y)
          case Failure(t) => Left(TypeCoercionError(t))
        },
      x => (Json.stringify(x))
    )
  implicit val trail: DynamoFormat[Trail] = deriveDynamoFormat[Trail]
  implicit val cardType: DynamoFormat[CardType] = deriveDynamoFormat[CardType]
  implicit val editionsCard: DynamoFormat[EditionsClientCard] =
    deriveDynamoFormat[EditionsClientCard]
  implicit val userData: DynamoFormat[UserData] = deriveDynamoFormat[UserData]
  private lazy val userDataTable =
    Table[UserData](config.faciatool.userDataTable)

  private def updateClipboardContentByFieldName[T](
      maybeJson: Option[JsValue],
      userEmail: String,
      fieldName: String
  )(implicit dynamoFormat: DynamoFormat[T], jsonFormat: Reads[T]) = {
    maybeJson.map(_.validate[T]) match {
      case Some(JsSuccess(model, _)) =>
        Scanamo(dynamoClient).exec(
          userDataTable.update(
            UniqueKey("email" === userEmail),
            set(fieldName, model)
          )
        )
        Ok
      case Some(JsError(errors)) =>
        BadRequest(errors.toString())
      case None => BadRequest
    }
  }

  def putClipboardContent() = APIAuthAction { request =>
    updateClipboardContentByFieldName[List[Trail]](
      request.body.asJson,
      request.user.email,
      "clipboardArticles"
    )
  }

  def putEditionsClipboardContent() = APIAuthAction { request =>
    updateClipboardContentByFieldName[List[EditionsClientCard]](
      request.body.asJson,
      request.user.email,
      "editionsClipboardArticles"
    )
  }

  def putFeastClipboardContent() = APIAuthAction { request =>
    updateClipboardContentByFieldName[List[EditionsClientCard]](
      request.body.asJson,
      request.user.email,
      "feastEditionsClipboardCards"
    )
  }

  def putFrontIds() = APIAuthAction { request =>
    val maybeFrontIds: Option[List[String]] =
      request.body.asJson.flatMap(_.asOpt[List[String]])
    maybeFrontIds match {
      case Some(frontIds) =>
        Scanamo(dynamoClient).exec(
          userDataTable.update(
            "email" === request.user.email,
            set("frontIds", frontIds)
          )
        )
        Ok
      case _ => BadRequest
    }
  }

  def putFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFrontIdsByPriority: Option[Map[String, List[String]]] =
      request.body.asJson.flatMap(_.asOpt[Map[String, List[String]]])
    maybeFrontIdsByPriority match {
      case Some(frontIdsByPriority) =>
        Scanamo(dynamoClient).exec(
          userDataTable.update(
            "email" === request.user.email,
            set("frontIdsByPriority", frontIdsByPriority)
          )
        )
        Ok
      case _ => BadRequest
    }
  }

  def putFavouriteFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFavouriteFrontIdsByPriority: Option[Map[String, List[String]]] =
      request.body.asJson.flatMap(_.asOpt[Map[String, List[String]]])
    maybeFavouriteFrontIdsByPriority match {
      case Some(favouriteFrontIdsByPriority) =>
        Scanamo(dynamoClient).exec(
          userDataTable.update(
            "email" === request.user.email,
            set("favouriteFrontIdsByPriority", favouriteFrontIdsByPriority)
          )
        )
        Ok
      case _ => BadRequest
    }
  }

  def putFeatureSwitch() = APIAuthAction { request =>
    val maybeFeatureSwitch: Option[FeatureSwitch] =
      request.body.asJson.flatMap(_.asOpt[FeatureSwitch])
    val maybeUserData: Option[UserData] = Scanamo(dynamoClient)
      .exec(userDataTable.get("email" === request.user.email))
      .flatMap(_.toOption)

    (maybeUserData, maybeFeatureSwitch) match {
      case (Some(userData), Some(featureSwitch)) =>
        if (FeatureSwitches.all.map(_.key).contains(featureSwitch.key)) {
          val updatedSwitches = FeatureSwitches.updateFeatureSwitchesForUser(
            userData.featureSwitches,
            featureSwitch
          )
          Scanamo(dynamoClient).exec(
            userDataTable.update(
              "email" === request.user.email,
              set("featureSwitches", updatedSwitches)
            )
          )
          Ok
        } else {
          BadRequest(s"Feature with key ${featureSwitch.key} not found")
        }
      case _ => BadRequest
    }
  }
}
