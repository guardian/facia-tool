package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PandaAuthController(val config: ApplicationConfiguration) extends Controller with PanDomainAuthActions {

  def oauthCallback = Action.async { implicit request =>
    processGoogleCallback()
  }

  def logout = Action.async { implicit request =>
    Future(processLogout)
  }

  def authError(message: String) = Action.async { implicit request =>
    Future(Forbidden(views.html.auth.login(Some(message))))
  }

  def user() = AuthAction { implicit request =>
    Ok(request.user.toJson).as(JSON)
  }

  def status = AuthAction { request =>
    val user = request.user
    Ok(views.html.auth.status(user.toJson))
  }
}
