package services

import java.io.FileInputStream
import conf.ApplicationConfiguration
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsError, JsPath, JsSuccess, Json, Reads}

import scala.io.Source

class InvalidAssetsException(msg: String) extends RuntimeException(msg)

object Bundles {
  implicit val jsonRead: Reads[Bundles] = (
    (JsPath \ "config.js").read[String] and
      (JsPath \ "collections.js").read[String]
  )(Bundles.apply _)
}
case class Bundles(config: String, collections: String)

class AssetsManager(config: ApplicationConfiguration, isDev: Boolean) {
  val resourcePath = "public/fronts-client-v1/bundles/assets-map.json"
  val assetsMap = if (isDev) None else Some(readFromPath(resourcePath))

  private def readFromPath(path: String): Bundles = {
    val assetsMapSource = Source.fromResource(path)
    val maybeJson = Json.parse(assetsMapSource.mkString)
    maybeJson.validate[Bundles] match {
      case e: JsError =>
        throw new InvalidAssetsException(
          s"JSON in $path does not match a valid Bundles"
        )
      case json: JsSuccess[Bundles] =>
        json.getOrElse(
          throw new InvalidAssetsException(s"Invalid JSON Bundle in $path")
        )
    }
  }

  def pathForConfig: String = pathFor(assetsMap.map(_.config).getOrElse(""))
  def pathForCollections: String = pathFor(
    assetsMap.map(_.collections).getOrElse("")
  )

  private def pathFor(hashedFileName: String): String = {
    s"/assets/fronts-client-v1/bundles/$hashedFileName"
  }
}
