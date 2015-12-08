package controllers

import auth.PanDomainAuthActions
import model.NoCache
import permissions.BreakingNewsPermissionCheck
import play.mvc.Controller

object VanityRedirects extends Controller with PanDomainAuthActions {

  def breakingnews = (AuthAction andThen BreakingNewsPermissionCheck) { request =>
    NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))}
}
