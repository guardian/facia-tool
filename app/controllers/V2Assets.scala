package controllers

import scala.concurrent.ExecutionContext.Implicits.global

class V2Assets(val assets: Assets) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/client-v2", relativePath + file)
  }
}
