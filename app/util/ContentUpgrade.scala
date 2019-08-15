package util

import com.gu.contentapi.client.model.v1.{Content, TagType}
import com.gu.contentapi.json.CirceDecoders._
import com.gu.facia.api.utils.{CardStyle, ResolvedMetaData}
import com.gu.facia.client.models.TrailMetaData
import io.circe.{Json, parser}
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
        val newValues:List[JField] = jsObject.values.map { case (key, _) =>
          if (ContentFields.contains(key)) {
            jsObject \ key match {
              case JArray(items) => (key -> JArray(items.map(upgradeItem)))
              case item: JObject => (key -> upgradeItem(item))
              case value => (key, value)
            }
          } else {
            (key, jsObject \ key)
          }
        }.toList

        JObject("response" -> JObject(newValues))

      case x => x
    }
  }

  def upgradeItem(json: JValue): JValue = {
    Try({
      val jsonString = JsonMethods.compact(JsonMethods.render(json))
      val maybeParsedJson: Option[Json] = parser.parse(jsonString).right.toOption
      val maybeCapiContent: Option[Content] = maybeParsedJson.flatMap(json => json.as[Content].right.toOption)
      (json, maybeCapiContent) match {
        case (jsObject: JObject, Some(content)) =>
          val cardStyle = CardStyle(content, TrailMetaData.empty)
          val initialMetaDataMap: Map[String, Boolean] = ResolvedMetaData.toMap(ResolvedMetaData.fromContent(content, cardStyle))

          // ResolvedMetaData here has a ton of booleans, but some may have been set naively
          // If the cutout bool is set, we want to find the cutout values and add them in to a sub-object
          val (metaDataMap, maybeFirstContributorWithCutout) = initialMetaDataMap.get("imageCutoutReplace") match {
            case Some(true) => {
              getBylineLargeImageUrlOption(content)  match {
                case bylineLargeImageUrlOption@Some(_) => (initialMetaDataMap, bylineLargeImageUrlOption)
                // If we can't find a cutout value, turn off the cutout bool
                case None => (initialMetaDataMap + ("imageCutoutReplace" -> false), None)
              }
            }
            case _ => (initialMetaDataMap, None)
          }

          jsObject ~ ("frontsMeta" ->
            ("defaults" -> metaDataMap)
              ~ ("tone" -> cardStyle.toneString)
              ~ ("cutout" -> maybeFirstContributorWithCutout)
          )
        case _ => json
      }
    }) match {
      case Success(capiItem) => capiItem
      case Failure(_) => json
    }
  }

  private def getBylineLargeImageUrlOption(content: Content) = {
    content.tags
      .filter(t => t.`type` == TagType.Contributor)
      .find(t => t.bylineLargeImageUrl.isDefined)
      .flatMap(t => t.bylineLargeImageUrl)
  }
}
