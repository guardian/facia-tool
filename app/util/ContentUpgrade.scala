package util

import com.gu.contentapi.client.model.v1.Content
import com.gu.facia.api.utils.ResolvedMetaData
import logic.CapiPrefiller
import org.json4s.JsonAST._
import org.json4s.JsonAST.JObject
import com.gu.contentapi.json.CirceDecoders._
import io.circe.{Json, parser}
import logging.Logging
import org.json4s.JValue
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods

import scala.util.{Failure, Success, Try}

/** Helper for Facia tool - passes over the JSON that is proxied, adding in
  * defaults
  */
object ContentUpgrade extends Logging {
  val ContentFields = Seq(
    "content",
    "results",
    "relatedContent",
    "editorsPicks",
    "mostViewed",
    "storyPackage",
    "leadContent"
  )

  def rewriteBody(body: String) = JsonMethods.compact(
    JsonMethods.render(upgradeResponse(JsonMethods.parse(body)))
  )

  def upgradeResponse(json: JValue) = {
    json \ "response" match {

      case JObject(fields) =>
        val newValues: List[JField] = fields.map {
          case (key, JArray(items)) if ContentFields.contains(key) =>
            key -> JArray(items.map(upgradeItem))
          case (key, item: JObject) if ContentFields.contains(key) =>
            key -> upgradeItem(item)
          case ignore => ignore
        }

        JObject("response" -> JObject(newValues))

      case x => x
    }
  }

  def upgradeItem(json: JValue): JValue = {
    Try(getUpgradedItem(json)) match {
      case Success(capiItem) => capiItem
      case Failure(_)        => {
        logger.warn(s"Unable to upgrade provided json: ${json}")
        json
      }
    }
  }

  private def getUpgradedItem(json: JValue): JValue = {
    val jsonString = JsonMethods.compact(JsonMethods.render(json))
    val maybeParsedJson: Option[Json] = parser.parse(jsonString).toOption
    val maybeCapiContent: Option[Content] =
      maybeParsedJson.flatMap(json => json.as[Content].toOption)
    (json, maybeCapiContent) match {
      case (jsObject: JObject, Some(content)) => {

        val prefill = CapiPrefiller.prefill(content)

        (jsObject
          ~ ("frontsMeta" ->
            ("defaults" -> ResolvedMetaData.toMap(prefill.metaData))
            ~ ("tone" -> prefill.tone)
            ~ ("cutout" -> prefill.cutout.map(_.src))
            ~ ("pickedKicker" -> prefill.pickedKicker)
            ~ ("mediaType" -> prefill.mediaType.map(_.toString))))
      }
      case _ => {
        logger.warn(s"Unable to prefill provided json: ${json}")
        json
      }
    }
  }

}
