package model

import com.gu.facia.client.models.Trail
import model.editions.client.EditionsClientCard
import org.scanamo.{DynamoFormat, TypeCoercionError}
import play.api.libs.json.{JsValue, Json, OFormat}

import scala.util.{Failure, Success, Try}

object UserData {
  implicit val jsonFormat: OFormat[UserData] = Json.format[UserData]

  implicit val jsValueFormat: DynamoFormat[JsValue] =
    DynamoFormat.xmap[JsValue, String](
      x =>
        Try(Json.parse(x)) match {
          case Success(y) => Right(y)
          case Failure(f) => Left(TypeCoercionError(f))
        },
      Json.stringify(_)
    )
}

/** Example of frontIdsByPriority data model: "favouriteFrontIdsByPriority": {
  * "editorial": [ "uk/news", "au/news" ] }
  * @TODO
  *   make these strongly typed via com.gu.facia.client.models package
  */
case class UserData(
    email: String,
    clipboardArticles: Option[List[Trail]] = None,
    editionsClipboardArticles: Option[List[EditionsClientCard]] = None,
    feastEditionsClipboardCards: Option[List[EditionsClientCard]] = None,
    frontIds: Option[List[String]] = None,
    frontIdsByPriority: Option[Map[String, List[String]]] = None,
    favouriteFrontIdsByPriority: Option[Map[String, List[String]]] = None,
    featureSwitches: Option[List[FeatureSwitch]] = Some(
      List.empty[FeatureSwitch]
    )
)

object UserDataForDefaults {
  implicit val jsonFormat: OFormat[UserDataForDefaults] =
    Json.format[UserDataForDefaults]

  def fromUserData(
      userData: UserData,
      clipboardArticles: Option[List[ClipboardCard]]
  ): UserDataForDefaults = {
    val featureSwitches = userData.featureSwitches.fold(FeatureSwitches.all) {
      userFeatureSwitches =>
        val userFeatureSwitchKeys = userFeatureSwitches.map(_.key)
        val unsetFeatureSwitches = FeatureSwitches.all.filter(featureSwitch =>
          !userFeatureSwitchKeys.contains(featureSwitch.key)
        )
        unsetFeatureSwitches ++ FeatureSwitches.removeUnknownSwitches(
          userFeatureSwitches
        )
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
    clipboardArticles: Option[List[ClipboardCard]],
    frontIds: Option[List[String]],
    frontIdsByPriority: Option[Map[String, List[String]]],
    favouriteFrontIdsByPriority: Option[Map[String, List[String]]],
    featureSwitches: Option[List[FeatureSwitch]] = Some(
      List.empty[FeatureSwitch]
    )
)
