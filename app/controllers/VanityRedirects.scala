package controllers

import scala.concurrent.ExecutionContext
import model.NoCache
import permissions.BreakingNewsPermissionCheck
import util.Acl

class VanityRedirects(val acl: Acl, val deps: BaseFaciaControllerComponents)(
    implicit ec: ExecutionContext
) extends BaseFaciaController(deps) {

  private def breakingNewsRedirectUrl: String = {
    if (deps.config.redirectToDispatch) {
      deps.config.environment.dispatchToolUrl
    } else {
      "/editorial?layout=latest,front:breaking-news"
    }
  }

  def breakingnews =
    (AccessAuthAction andThen new BreakingNewsPermissionCheck(acl)) { request =>
      NoCache(Redirect(breakingNewsRedirectUrl, 301))
    }

  def untrail(path: String) = Action { request =>
    NoCache(Redirect(VanityRedirects.untrailTarget(path), 301))
  }

}

object VanityRedirects {
  // A "//host" Location is protocol-relative, so leading slashes must be stripped to avoid an open redirect
  def untrailTarget(path: String): String = "/" + path.dropWhile(_ == '/')
}
