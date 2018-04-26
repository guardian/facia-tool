package controllers

class UncachedAssets(val assets: Assets, deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/src", relativePath + file)
  }
}
