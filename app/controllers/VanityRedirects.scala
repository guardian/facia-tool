package controllers

import scala.concurrent.ExecutionContext
import model.NoCache
import permissions.BreakingNewsPermissionCheck
import util.Acl

class VanityRedirects(val acl: Acl, val deps: BaseFaciaControllerComponents)(
    implicit ec: ExecutionContext
) extends BaseFaciaController(deps) {

  def breakingnews =
    (AccessAuthAction andThen new BreakingNewsPermissionCheck(acl)) { request =>
      NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))
    }

  def untrail(path: String) = Action { request =>
    NoCache(Redirect("/" + path, 301))
  }

}
