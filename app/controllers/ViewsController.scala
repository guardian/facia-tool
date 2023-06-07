package controllers

import scala.concurrent.ExecutionContext
import com.gu.pandomainauth.action.UserRequest
import model.Cached
import org.joda.time.DateTime
import permissions.ConfigPermissionCheck
import play.api.mvc._
import util.Acl

import java.io.File

class ViewsController(
  val acl: Acl,
  isDev: Boolean,
  val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  private def getV1DistFilename(prefix: String) =
    new File("public/dist/")
      .listFiles()
      .sortBy(_.lastModified())
      .findLast(file => file.getName.startsWith(prefix) && file.getName.endsWith(".js"))
      .get
      .getName
  private val v1ConfigBundleHashedName = getV1DistFilename("config-")
  private val v1CollectionsBundleHashedName = getV1DistFilename("collections-")
  private val v1jQueryBundleHashedName = getV1DistFilename("loadJQuery-")

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
        Ok(views.html.priority(
          identity = Option(identity),
          stage = config.facia.stage,
          isDev = isDev,
          displayV2Message = true
        ))
      }
    }
  }

  def collectionEditor(priority: String) = getCollectionPermissionFilterByPriority(priority, acl)(ec) { request =>
    if (shouldRedirectToV2(request, Some(priority))) {
      PermanentRedirect(s"/v2/$priority")
    } else {
      val identity = request.user
      Cached(60) {
        Ok(views.html.admin_main(
          identity = Option(identity),
          stage = config.facia.stage,
          isDev = overrideIsDev(request, isDev),
          jQueryFilename = if(isDev) getV1DistFilename("loadJQuery-") else v1jQueryBundleHashedName,
          bundleFilename = if(isDev) getV1DistFilename("collections-") else v1CollectionsBundleHashedName,
          displayV2Message = priority != "email",
          priority = priority
        ))
      }
    }
  }

  def configEditor() = (AccessAuthAction andThen new ConfigPermissionCheck(acl)) { request =>
    val identity = request.user
    Cached(60) {
      Ok(views.html.admin_main(
        identity = Option(identity),
        stage = config.facia.stage,
        isDev = overrideIsDev(request, isDev),
        jQueryFilename = if(isDev) getV1DistFilename("loadJQuery-") else v1jQueryBundleHashedName,
        bundleFilename = if(isDev) getV1DistFilename("config-") else v1ConfigBundleHashedName,
        displayV2Message = false
      ))
    }
  }

  private def overrideIsDev(request: UserRequest[AnyContent], isDev: Boolean): Boolean = {
    request.queryString.getOrElse("isDev", Seq(if (isDev) "true" else "false")).contains("true")
  }
}
