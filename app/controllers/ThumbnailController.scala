package controllers

import model.Cached
import thumbnails.ContainerThumbnails

class ThumbnailController(
    val containerThumbnails: ContainerThumbnails,
    val deps: BaseFaciaControllerComponents
) extends BaseFaciaController(deps) {
  def container(id: String) = AccessAPIAuthAction {
    containerThumbnails.fromId(id) match {
      case Some(thumbnail) =>
        Cached(86400)(Ok(thumbnail).as("image/svg+xml"))

      case None => NotFound
    }
  }
}
