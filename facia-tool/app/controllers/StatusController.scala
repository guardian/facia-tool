package controllers

import common.ExecutionContexts
import play.api.mvc.{Action, Controller}

object StatusController extends Controller with ExecutionContexts {

  def healthStatus = Action { request =>
    Ok("Ok.")
  }
}
