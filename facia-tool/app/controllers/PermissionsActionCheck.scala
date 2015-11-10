package controllers

import com.gu.editorial.permissions.client.{PermissionsUser, PermissionDenied, PermissionGranted}
import com.gu.pandomainauth.action.UserRequest
import conf.Switches
import play.api.Logger
import play.api.mvc._
import permissions._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object ConfigPermissionCheck extends ActionFilter[UserRequest] {

  override def filter[A](request: UserRequest[A]) = {
    implicit def permissionsUser: PermissionsUser = PermissionsUser(request.user.email)

    if (!Switches.FaciaToolAllowConfigForAll.isSwitchedOn) {
      Permissions.get(Permissions.ConfigureFronts).map {
        case PermissionGranted => None
        case PermissionDenied => {
          Logger.info("user not authorized to configure fronts")
          Some(Results.Unauthorized(views.html.unauthorized()))
        }
      }
    }
    else {
      Logger.info("allowing user to access config because the switch override is on")
      Future.successful(None)
    }
  }
}
