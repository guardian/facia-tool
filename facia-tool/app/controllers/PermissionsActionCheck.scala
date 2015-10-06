package controllers

import com.gu.pandomainauth.action.UserRequest
import conf.Switches
import permissions.{SimplePermission, PermissionsReader}
import play.api.Logger
import play.api.mvc._

import scala.concurrent.Future

object ConfigPermissionCheck extends ActionFilter[UserRequest] {
  override def filter[A](request: UserRequest[A]) = {
    import scala.concurrent.ExecutionContext.Implicits.global
    if (!Switches.FaciaToolAllowConfigForAll.isSwitchedOn) {
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
    else {
      Logger.info("allowing user to access config because the switch override is on")
      Future.successful(None)
    }

  }
}
