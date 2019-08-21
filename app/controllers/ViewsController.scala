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

  private def shouldRedirectToV2(request: UserRequest[AnyContent]): Boolean = {
    val shouldRedirectByQs: Boolean = request.queryString.getOrElse("redirect", Seq("true")).contains("true")

    // TODO set correct date
    val redirectDay = DateTime.parse("2019-12-25")
    val shouldRedirectByDate: Boolean = DateTime.now().isAfter(redirectDay)

    shouldRedirectByQs && (isDev || shouldRedirectByDate)
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
    if (shouldRedirectToV2(request)) {
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
