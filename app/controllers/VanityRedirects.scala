package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import model.NoCache
import permissions.BreakingNewsPermissionCheck
import play.mvc.Controller
import util.Acl

class VanityRedirects(val config: ApplicationConfiguration, val acl: Acl) extends Controller with PanDomainAuthActions {

  def breakingnews = (AuthAction andThen new BreakingNewsPermissionCheck(acl)) { request =>
    NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))}
}
