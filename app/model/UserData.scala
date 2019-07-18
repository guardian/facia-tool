package model

import com.gu.facia.client.models.Trail
import com.gu.scanamo.DynamoFormat
import com.gu.scanamo.error.TypeCoercionError
import play.api.libs.json.{JsValue, Json}

import scala.util.{Failure, Success, Try}

object UserData {
  implicit val jsonFormat = Json.format[UserData]

  implicit val jsValueFormat: DynamoFormat[JsValue] = DynamoFormat.xmap[JsValue, String](
    x => Try(Json.parse(x)) match {
      case Success(y) => Right(y)
      case Failure(f) => Left(TypeCoercionError(f))
    }
  )(Json.stringify(_))
}

/**
  * Example of frontIdsByPriority data model:
  * "favouriteFrontIdsByPriority": {
  *   "editorial": [
  *     "uk/news",
  *     "au/news"
  *   ]
  * }
  * @TODO make these strongly typed via com.gu.facia.client.models package
  */
case class UserData(
                     email: String,
                     clipboardArticles: Option[List[Trail]],
<<<<<<< HEAD
                     editionsClipboardArticles: Option[List[Trail]],
=======
>>>>>>> Add feature switches to outgoing app defaults; modifications to feature switch model
                     frontIds: Option[List[String]],
                     frontIdsByPriority: Option[Map[String, List[String]]],
                     favouriteFrontIdsByPriority: Option[Map[String, List[String]]],
                     featureSwitches: Option[List[FeatureSwitch]] = Some(List.empty[FeatureSwitch])
)

object UserDataForDefaults {
  implicit val jsonFormat = Json.format[UserDataForDefaults]

<<<<<<< HEAD
  def fromUserData(userData: UserData, clipboardArticles: Option[List[Trail]]): UserDataForDefaults = {
    val featureSwitches = userData.featureSwitches.fold(FeatureSwitches.all) { userFeatureSwitches =>
      val unsetFeatureSwitches = FeatureSwitches.all.diff(userFeatureSwitches)
      unsetFeatureSwitches ++ userFeatureSwitches
    }
    UserDataForDefaults(
      clipboardArticles,
=======
  def fromUserData(userData: UserData): UserDataForDefaults = {
    val featureSwitches = userData.featureSwitches.fold(FeatureSwitches.all) { userFeatureSwitches =>
      val unsetFeatureSwitches = userFeatureSwitches.diff(FeatureSwitches.all)
      unsetFeatureSwitches ++ userFeatureSwitches
    }
    UserDataForDefaults(
      userData.clipboardArticles,
>>>>>>> Add feature switches to outgoing app defaults; modifications to feature switch model
      userData.frontIds,
      userData.frontIdsByPriority,
      userData.favouriteFrontIdsByPriority,
      Some(featureSwitches)
    )
  }
}

case class UserDataForDefaults(
  clipboardArticles: Option[List[Trail]],
  frontIds: Option[List[String]],
  frontIdsByPriority: Option[Map[String, List[String]]],
  favouriteFrontIdsByPriority: Option[Map[String, List[String]]],
  featureSwitches: Option[List[FeatureSwitch]] = Some(List.empty[FeatureSwitch])
)



