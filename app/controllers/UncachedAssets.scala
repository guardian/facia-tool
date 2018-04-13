package controllers

import play.api.mvc.Controller

class UncachedAssets(assets: Assets) extends Controller {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/src", relativePath + file)
  }
}
