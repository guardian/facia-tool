package services

import conf.ApplicationConfiguration
import play.api.libs.ws.WSAPI
import play.api.libs.json._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

//These need to be at the top of the file in this order for json deserialisation
case class Asset(size: Int, secureUrl: String)
object Asset {
  implicit val format = Json.format[Asset]
}

case class Export(id: String, assets: List[Asset])
object Export {
  implicit val format = Json.format[Export]
}

class MediaApi(val config: ApplicationConfiguration, val ws: WSAPI) {

  def getThumbnail(imgId: String, cropId: String): Future[Option[String]] = {
    val gridUrl = s"${config.media.apiUrl}/images/$imgId"

    ws.url(gridUrl).withHeaders("X-Gu-Media-Key" -> config.media.key).get().map(
      response => extractExportsFromJsonResponse(response.json, cropId))
  }

  def extractExportsFromJsonResponse(response: JsValue, cropId: String) = {
    val exports = (response \ "data" \ "exports").as[List[Export]]
    exports.find(_.id == cropId) match {
      case Some(export) => Some(export.assets.sortBy(asset => asset.size).head.secureUrl)
      case _ => None
    }
  }
}




