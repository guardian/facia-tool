package model

import com.gu.facia.client.models.Trail
import org.scanamo.{DynamoFormat, TypeCoercionError}
import play.api.libs.json.{JsValue, Json}

import scala.util.{Failure, Success, Try}

object UserData {
  implicit val jsonFormat = Json.format[UserData]

  implicit val jsValueFormat: DynamoFormat[JsValue] = DynamoFormat.xmap[JsValue, String](
    x => Try(Json.parse(x)) match {
      case Success(y) => Right(y)
      case Failure(f) => Left(TypeCoercionError(f))
    },
    Json.stringify(_)
  )
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
                     clipboardArticles: Option[List[Trail]] = None,
                     editionsClipboardArticles: Option[List[Trail]] = None,
                     frontIds: Option[List[String]] = None,
                     frontIdsByPriority: Option[Map[String, List[String]]] = None,
                     favouriteFrontIdsByPriority: Option[Map[String, List[String]]] = None,
                     featureSwitches: Option[List[FeatureSwitch]] = Some(List.empty[FeatureSwitch])
)

object UserDataForDefaults {
  implicit val jsonFormat = Json.format[UserDataForDefaults]

  def fromUserData(userData: UserData, clipboardArticles: Option[List[Trail]]): UserDataForDefaults = {
    val featureSwitches = userData.featureSwitches.fold(FeatureSwitches.all) { userFeatureSwitches =>
      val userFeatureSwitchKeys = userFeatureSwitches.map(_.key)
      val unsetFeatureSwitches = FeatureSwitches.all.filter(featureSwitch => !userFeatureSwitchKeys.contains(featureSwitch.key))
      unsetFeatureSwitches ++ FeatureSwitches.removeUnknownSwitches(userFeatureSwitches)
    }
    UserDataForDefaults(
      clipboardArticles,
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



