package updates

import com.gu.facia.client.models.CollectionJson
import play.api.libs.json.{Format, Json}

case class V2Update (id: String, updateType: String, collection: CollectionJson, isLive: Boolean)

object V2Update {
  implicit val jsonFormat: Format[V2Update] = Json.format[V2Update]
}

