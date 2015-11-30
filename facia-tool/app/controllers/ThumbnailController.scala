package controllers

import model.Cached
import play.api.mvc.{Action, Controller}
import thumbnails.ContainerThumbnails

object ThumbnailController extends Controller {
  def container(id: String) = Action {
    ContainerThumbnails.fromId(id) match {
      case Some(thumbnail) =>
        Cached(86400)(Ok(thumbnail).as("image/svg+xml"))

      case None => NotFound
    }
  }
}
