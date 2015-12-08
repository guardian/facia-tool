package controllers

object UncachedAssets extends play.api.mvc.Controller {
  def at(file: String, relativePath: String = "") = model.NoCache {
    controllers.Assets.at("/public/src", relativePath + file)
  }
}
