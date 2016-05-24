package services

import java.io.FileInputStream

import conf.ApplicationConfiguration
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsError, JsPath, JsSuccess, Json}


class InvalidAssetsException(msg: String) extends RuntimeException(msg)

object Bundles {
  implicit val jsonRead = (
    (JsPath \ "config.js").read[String] and
    (JsPath \ "collections.js").read[String]
  )(Bundles.apply _)
}
case class Bundles (config: String, collections: String)


class AssetsManager(config: ApplicationConfiguration, isDev: Boolean) {
  val filePath = "/etc/gu/facia-tool.assets-map.json"
  val assetsMap: Option[Bundles] = if (isDev) None else Some(readFromPath(filePath))

  private def readFromPath(path: String): Bundles = {
    val stream = new FileInputStream(filePath)
    val maybeJson = try { Json.parse(stream) } finally { stream.close() }
    maybeJson.validate[Bundles] match {
      case e: JsError => throw new InvalidAssetsException(s"JSON in $filePath does not match a valid Bundles")
      case json: JsSuccess[Bundles] => json.getOrElse(throw new InvalidAssetsException(s"Invalid JSON Bundle in $filePath"))
    }
  }

  def pathForConfig: String = pathFor(assetsMap.map(_.config).getOrElse(""))
  def pathForCollections: String = pathFor(assetsMap.map(_.collections).getOrElse(""))

  private def pathFor(hashedFileName: String): String = {
    s"${config.cdn.basePath}$hashedFileName"
  }
}
