package services

import play.api.http.DefaultHttpErrorHandler
import play.api.mvc.RequestHeader
import play.api.routing.Router
import play.api.{Configuration, Environment, Logger}
import play.core.SourceMapper

class LoggingHttpErrorHandler(
                               env: Environment,
                               config: Configuration,
                               sourceMapper: Option[SourceMapper],
                               router: => Option[Router]
                             ) extends DefaultHttpErrorHandler(env, config, sourceMapper, router) {

  override def onClientError(request: RequestHeader, statusCode: Int, message: String) = {
    Logger.error(s"Client HTTP error - Request: ${RequestHeader.toString} | Status: $statusCode | Message: $message")
    super.onClientError(request, statusCode, message)
  }

  override def onServerError(request: RequestHeader, exception: Throwable) = {
    Logger.error(s"Server HTTP error - Request: ${RequestHeader.toString} | Exception: ${exception.toString}")
    super.onServerError(request, exception)
  }
}
