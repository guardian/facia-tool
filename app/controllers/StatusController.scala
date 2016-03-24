package controllers

import play.api.mvc.{Action, Controller}

class StatusController extends Controller {

  def healthStatus = Action { request =>
    Ok("Ok.")
  }
}
