package controllers

import auth.PanDomainAuthActions
import conf.ApplicationConfiguration
import EmailController._
import play.api.Logger
import play.api.mvc.Controller
import services.Email

import scala.util.{Failure, Success}

class EmailController(val config: ApplicationConfiguration, email: Email) extends Controller with PanDomainAuthActions {

  def sendEmail(path: String) = APIAuthAction { request =>
    val mapiPath = buildMapiPath(path)

    email.sendEmail(
      to = request.user.email,
      subject = s"App preview URLs for front: $path",
      body = buildBody(mapiPath)
    ) match {
      case Success(_) => Ok
      case Failure(e) =>
        Logger.warn(s"Error sending app preview email to ${request.user.email}: ${e.getMessage}", e)
        InternalServerError
    }
  }
}

object EmailController {
  private val Editions = Set("uk", "us", "au")

  def buildMapiPath(path: String): String = {
    val pathTokens = path.split("/")
    pathTokens.toList match {
      case x :: Nil if Editions.contains(x) => s"$x/fronts/home"
      case x :: xs if Editions.contains(x) => s"$x/fronts/${xs.mkString("/")}"
      case _ => s"uk/fronts/$path"
    }
  }

  def buildBody(path: String): String = {
    s"""iOS: https://entry.mobile-apps.guardianapis.com/deeplink/$path
       |Android: https://mobile-preview.guardianapis.com/$path
       |
       |
       |If you were not expecting this email please contact: digitalcms.dev@guardian.co.uk""".stripMargin
  }
}
