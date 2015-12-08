package util

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.parser.JsonParser._
import com.gu.facia.api.utils.{CardStyle, ResolvedMetaData}
import com.gu.facia.client.models.TrailMetaData
import org.json4s.JValue
import org.json4s.JsonAST._
import org.json4s.native.JsonMethods
import util.Json4s._

/** Helper for Facia tool - passes over the JSON that is proxied, adding in defaults */
object ContentUpgrade {
  val ContentFields = Seq(
    "content",
    "results",
    "relatedContent",
    "editorsPicks",
    "mostViewed",
    "storyPackage",
    "leadContent"
  )

  def rewriteBody(body: String) = {
    JsonMethods.compact(JsonMethods.render(upgradeResponse(JsonMethods.parse(body))))
  }

  def upgradeResponse(json: JValue) = {
    json \ "response" match {
      case jsObject: JObject =>
        JObject("response" -> (jsObject update JObject(ContentFields flatMap { field =>
          jsObject \ field match {
            case JArray(items) => Some(field -> JArray(items.map(upgradeItem)))
            case item: JObject => Some(field -> upgradeItem(item))
            case _ => None
          }
        }: _*)))

      case x => x
    }
  }

  def upgradeItem(json: JValue): JValue = {
    //Used to upgrade Content items with the CardStyle and MetaDataDefaults it will receive.
    (json, json.extractOpt[ApiContent]) match {
      case (jsObj: JObject, Some(content)) =>
        val cardStyle: CardStyle = CardStyle(content, TrailMetaData.empty)
        val metaDataMap: Map[String, Boolean] = ResolvedMetaData.toMap(ResolvedMetaData.fromContent(content, cardStyle))


        import org.json4s.JsonDSL._

        jsObj update ("frontsMeta" ->
          ("defaults" -> metaDataMap) ~
          ("tone" -> cardStyle.toneString))

      case _ =>
        json
    }
  }
}
