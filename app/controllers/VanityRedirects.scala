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
    NoCache(Redirect("/" + path, 301))
  }

}
