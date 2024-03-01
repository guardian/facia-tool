package controllers

import scala.concurrent.ExecutionContext

class V2Assets(val assets: Assets)(implicit ec: ExecutionContext) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/fronts-client-v2", relativePath + file)
  }
}
