package controllers

import auth.PanDomainAuthActions
import com.gu.pandomainauth.action.UserRequest
import conf.ApplicationConfiguration
import model.Cached
import permissions.{ConfigPermissionCheck, Permissions, ToolsAccessPermissionCheck}
import play.api.mvc._
import services.AssetsManager
import util.{Acl, Encryption}

class ViewsController(val config: ApplicationConfiguration, val acl: Acl, assetsManager: AssetsManager, isDev: Boolean,
                      crypto: Encryption, permissions: Permissions) extends Controller with PanDomainAuthActions {

  def priorities() = (AuthAction andThen new ToolsAccessPermissionCheck(permissions)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.priority(Option(identity), config.facia.stage, isDev))
    }
  }

  def collectionEditor() = (AuthAction andThen new ToolsAccessPermissionCheck(permissions)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request, isDev),
        assetsManager.pathForCollections, crypto.encrypt(identity.email)))
    }
  }

  def configEditor() = (AuthAction andThen new ToolsAccessPermissionCheck(permissions) andThen new ConfigPermissionCheck(acl)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request, isDev),
        assetsManager.pathForConfig, crypto.encrypt(identity.email)))
    }
  }

  private def overrideIsDev(request: UserRequest[AnyContent], isDev: Boolean): Boolean = {
    request.queryString.getOrElse("isDev", Seq(if (isDev) "true" else "false")).contains("true")
  }
}
