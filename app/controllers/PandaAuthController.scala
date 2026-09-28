package controllers

import play.api.mvc.Cookie

import scala.concurrent.{ExecutionContext, Future}

class PandaAuthController(val deps: BaseFaciaControllerComponents)(implicit
    ec: ExecutionContext
) extends BaseFaciaController(deps) {
  def localCookie = Action { implicit request =>
    config.e2e.authCookie
      .map(cookieValue =>
        Redirect(routes.V2App.index(""))
          .withCookies(
            Cookie(
              name = "gutoolsAuth-assym",
              value = cookieValue,
              maxAge = Some(24 * 60 * 60),
              path = "/",
              secure = config.e2e.authCookieSecure,
              httpOnly = true,
              sameSite = Some(Cookie.SameSite.Lax)
            )
          )
      )
      .getOrElse(NotFound)
  }

  def oauthCallback = Action.async { implicit request =>
    processOAuthCallback()
  }

  def logout = Action.async { implicit request =>
    Future(processLogout)
  }

  def authError(message: String) = Action.async { implicit request =>
    Future(Forbidden(views.html.auth.login(Some(message))))
  }

  def user() = AccessAuthAction { implicit request =>
    Ok(request.user.toJson).as(JSON)
  }

  def status = AccessAuthAction { request =>
    val user = request.user
    Ok(views.html.auth.status(user.toJson))
  }
}
