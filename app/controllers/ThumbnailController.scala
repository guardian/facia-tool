package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import model.Cached
import play.api.libs.ws.WSClient
import play.api.mvc.Controller
import thumbnails.ContainerThumbnails

class ThumbnailController(val containerThumbnails: ContainerThumbnails, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def container(id: String) = APIAuthAction {
    containerThumbnails.fromId(id) match {
      case Some(thumbnail) =>
        Cached(86400)(Ok(thumbnail).as("image/svg+xml"))

      case None => NotFound
    }
  }
}
