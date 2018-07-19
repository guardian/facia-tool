package controllers

class StatusController(deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  def healthStatus = Action(_ => Ok("Ok."))
}
