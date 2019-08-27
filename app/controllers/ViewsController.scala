package controllers

import scala.concurrent.ExecutionContext
import com.gu.pandomainauth.action.UserRequest
import model.Cached
import org.joda.time.DateTime
import permissions.ConfigPermissionCheck
import play.api.mvc._
import services.AssetsManager
import util.{Acl, Encryption}

class ViewsController(val acl: Acl, assetsManager: AssetsManager, isDev: Boolean,
                      crypto: Encryption, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  private def shouldRedirectToV2(request: UserRequest[AnyContent], priority: Option[String] = None): Boolean = {
    val isBreakingNews = priority.getOrElse("") == "breaking-news" || request.queryString.getOrElse("layout", Seq("")).exists(_.contains("breaking-news"))
    if (isBreakingNews) {
      false
    } else {
      request.queryString.getOrElse("redirect", Seq("true")).contains("true")
    }
  }

  def priorities() = AccessAuthAction { request =>
    if (shouldRedirectToV2(request)) {
      PermanentRedirect("/v2")
    } else {
      val identity = request.user
      Cached(60) {
        Ok(views.html.priority(Option(identity), config.facia.stage, isDev, true))
      }
    }
  }

  def collectionEditor(priority: String) = getCollectionPermissionFilterByPriority(priority, acl)(ec) { request =>
    if (shouldRedirectToV2(request, Some(priority))) {
      PermanentRedirect(s"/v2/$priority")
    } else {
      val identity = request.user
      Cached(60) {
        Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request, isDev),
          assetsManager.pathForCollections, crypto.encrypt(identity.email), priority != "email", priority))
      }
    }
  }

  def configEditor() = (AccessAuthAction andThen new ConfigPermissionCheck(acl)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(Option(identity), config.facia.stage, overrideIsDev(request, isDev),
        assetsManager.pathForConfig, crypto.encrypt(identity.email), false))
    }
  }

  private def overrideIsDev(request: UserRequest[AnyContent], isDev: Boolean): Boolean = {
    request.queryString.getOrElse("isDev", Seq(if (isDev) "true" else "false")).contains("true")
  }
}
