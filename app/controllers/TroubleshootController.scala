package controllers

import model.Cached
import auth.PanDomainAuthActions
import play.api.mvc.Controller

object TroubleshootController extends Controller with PanDomainAuthActions {
  def troubleshoot = AuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.troubleshoot(identity)) }}
}
