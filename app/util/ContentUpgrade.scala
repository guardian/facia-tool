package util

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.json.JsonParser
import com.gu.contentapi.json.JsonParser._
import com.gu.facia.api.utils.{CardStyle, ResolvedMetaData}
import com.gu.facia.client.models.TrailMetaData
import org.json4s.JValue
import org.json4s.JsonAST._
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods

import scala.util.{Failure, Success, Try}

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
        JObject("response" -> (jsObject ~ JObject(ContentFields flatMap { field =>
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
    Try({
      val jsonString = JsonMethods.compact(JsonMethods.render(json))
      val maybeCapiContent = JsonParser.parseContent(jsonString)

      (json, maybeCapiContent) match {
        case (jsObject: JObject, content: Content) =>
          val cardStyle = CardStyle(content, TrailMetaData.empty)
          val metaDataMap: Map[String, Boolean] = ResolvedMetaData.toMap(ResolvedMetaData.fromContent(content, cardStyle))

          jsObject ~ ("frontsMeta" ->
            ("defaults" -> metaDataMap) ~
              ("tone" -> cardStyle.toneString))
        case _ => json
      }
    }) match {
      case Success(capiItem) => capiItem
      case Failure(_) => json
    }
  }
}
