package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import model.Cached
import permissions.ConfigPermissionCheck
import play.api.mvc._
import services.AssetsManager
import util.Acl

class ViewsController(val config: ApplicationConfiguration, val acl: Acl, assetsManager: AssetsManager, isDev: Boolean) extends Controller with PanDomainAuthActions {

  def priorities() = AuthAction { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.priority(Option(identity), config.facia.stage, isDev))
    }
  }

  def collectionEditor() = AuthAction { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, isDev, assetsManager.pathForCollections))
    }
  }

  def configEditor() = (AuthAction andThen new ConfigPermissionCheck(acl)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, isDev, assetsManager.pathForConfig))
    }
  }
}
