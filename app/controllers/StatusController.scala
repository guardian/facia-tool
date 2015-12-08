package controllers

import play.api.mvc.{Action, Controller}

object StatusController extends Controller {

  def healthStatus = Action { request =>
    Ok("Ok.")
  }
}
