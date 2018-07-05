package controllers

class StatusController(deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  def healthStatus = Action {
    if(deps.permissions.storeIsEmpty) {
      ServiceUnavailable("Permissions store is empty")
    } else {
      Ok("Ok.")
    }
  }
}
