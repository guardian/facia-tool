package controllers

class V2Assets {
  def at(file: String, relativePath: String = "") = model.NoCache {
    controllers.Assets.at("/public/client-v2", relativePath + file)
  }
}
