package controllers

import logging.Logging
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext

class ConfigSelfDocsApi(configsMap: Map[String, String], val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) with Logging {

  def getBaseConfigs = EditEditionsAuthAction { _ =>
    Ok(Json.toJson(configsMap))
  }

}
