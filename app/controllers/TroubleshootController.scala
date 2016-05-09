package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import model.Cached
import play.api.mvc.Controller

class TroubleshootController(val config: ApplicationConfiguration) extends Controller with PanDomainAuthActions {
  def troubleshoot(section: String) = AuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.troubleshoot(identity)) }}
}
