package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import model.NoCache
import permissions.BreakingNewsPermissionCheck
import play.api.libs.ws.WSClient
import play.api.mvc.Action
import play.mvc.Controller
import util.Acl

class VanityRedirects(val acl: Acl, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  def breakingnews = (AuthAction andThen new BreakingNewsPermissionCheck(acl)) { request =>
    NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))}

  def untrail(path: String) = Action { request =>
    NoCache(Redirect("/" + path, 301))}
}
