package controllers

import auth.PanDomainAuthActions
import com.gu.pandomainauth.action.UserRequest
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
      Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request), assetsManager.pathForCollections))
    }
  }

  def configEditor() = (AuthAction andThen new ConfigPermissionCheck(acl)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request), assetsManager.pathForConfig))
    }
  }

  private def overrideIsDev(request: UserRequest[AnyContent]): Boolean = {
    request.queryString.getOrElse("isDev", Seq("false")).contains("true")
  }
}
