package controllers

import scala.concurrent.ExecutionContext.Implicits.global

class V1Assets(val assets: Assets, deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/src", relativePath + file)
  }
}
