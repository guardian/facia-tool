package controllers

import com.gu.pandomainauth.action.UserRequest
import permissions.{SimplePermission, PermissionsReader}
import play.api.Logger
import play.api.mvc._

object PermissionCheckAction extends ActionFilter[UserRequest] {
  override def filter[A](request: UserRequest[A]) = {
    import scala.concurrent.ExecutionContext.Implicits.global
    for {
      b <- PermissionsReader.get(SimplePermission.ConfigureFronts, request.user)
    } yield
      (if(b) {
        None
      }
      else {
        Logger.info("user not authorized to configure fronts")
        Some(Results.Unauthorized(views.html.unauthorized()))
      })
  }
}
