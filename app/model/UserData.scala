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
  editionsClipboardArticles: Option[List[Trail]],
  frontIds: Option[List[String]],
  frontIdsByPriority: Option[Map[String, List[String]]],
  favouriteFrontIdsByPriority: Option[Map[String, List[String]]]
)

object PutFeatureStatus {
  implicit val reads = Json.reads[PutFeatureStatus]
  implicit val writes = Json.writes[PutFeatureStatus]
}

case class PutFeatureStatus(featureName: String, enabled: Boolean)


