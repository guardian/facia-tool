package controllers

import scala.concurrent.ExecutionContext.Implicits.global

class V1Assets(val assets: Assets, deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  def aggressivelyCached(file: String) =
    assets.at("/public/dist", file, aggressiveCaching = true)
  def notCached(file: String) = model.NoCache {
    assets.at("/public/src", file)
  }
}
