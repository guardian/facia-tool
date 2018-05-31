package controllers

import model.Cached

class TroubleshootController(val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  def troubleshoot(section: String) = AuthAction { request =>
    val identity = request.user
    Cached(60) { Ok(views.html.troubleshoot(identity)) }}
}
