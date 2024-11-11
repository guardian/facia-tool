package controllers

import scala.concurrent.ExecutionContext.Implicits.global

class V1Assets(val assets: Assets, deps: BaseFaciaControllerComponents)
    extends BaseFaciaController(deps) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    if (file.startsWith("fronts-client-v1/bundles")) {
      assets.at("/public", relativePath + file)
    } else {
      assets.at("/public/src", relativePath + file)
    }
  }
}
