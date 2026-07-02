package controllers

import scala.concurrent.ExecutionContext

class NotificationsToolAssets(val assets: Assets)(implicit ec: ExecutionContext) {
  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public/notifications-client", relativePath + file)
  }
}
