package model

import conf.Configuration
import play.api.mvc.{RequestHeader, Result, Results}

object Cors extends Results {

  private val defaultAllowHeaders = List("X-Requested-With","Origin","Accept","Content-Type")

  def apply(result: Result, allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {

    val responseHeaders = (defaultAllowHeaders ++ request.headers.get("Access-Control-Request-Headers").toList) mkString ","

    request.headers.get("Origin") match {
      case None => result
      case Some(requestOrigin) => {
        val headers = allowedMethods.map("Access-Control-Allow-Methods" -> _).toList ++ List(
          "Access-Control-Allow-Origin" -> Configuration.ajax.corsOrigins.find(_ == requestOrigin).getOrElse("*"),
          "Access-Control-Allow-Headers" -> responseHeaders,
          "Access-Control-Allow-Credentials" -> "true")
        result.withHeaders(headers: _*)
      }
    }
  }
}
