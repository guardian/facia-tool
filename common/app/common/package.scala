package common

import java.util.concurrent.TimeoutException

import akka.pattern.CircuitBreakerOpenException
import com.gu.contentapi.client.GuardianContentApiError
import play.api.Logger
import play.api.libs.json.{JsObject, JsString}
import play.api.mvc.Result

object `package` extends implicits.Strings with implicits.Requests with play.api.mvc.Results {

  def convertApiExceptions[T](implicit log: Logger): PartialFunction[Throwable, Either[T, Result]] = {
    case e: CircuitBreakerOpenException =>
      log.error(s"Got a circuit breaker open error while calling content api")
      Right(ServiceUnavailable)
    case GuardianContentApiError(404, message) =>
      log.info(s"Got a 404 while calling content api: $message")
      Right(NotFound)
    case GuardianContentApiError(410, message) =>
      log.info(s"Got a 410 while calling content api: $message")
      Right(Gone)
    case timeout: TimeoutException =>
      log.info(s"Got a timeout while calling content api: ${timeout.getMessage}")
      Right(GatewayTimeout(timeout.getMessage))
    case error =>
      log.info(s"Content api exception: ${error.getMessage}")
      Option(error.getCause).map { cause =>
        log.info(s"Content api exception cause: ", cause)
      }
      Right(InternalServerError)
  }
}

object Reference {
  def apply(s: String) = {
    val parts = s.split("/")
    parts(0) -> parts.drop(1).mkString("/")
  }

  def toJavaScript(s: String) = {
    val (k, v) = apply(s)

    /** Yeah ... so ... in the JavaScript references are represented like this:
      *
      * "references":[{"esaFootballTeam":"/football/team/48"},{"optaFootballTournament":"5/2012"}57"} ... ]
      *
      * See for example the source of
      * http://www.theguardian.com/football/live/2014/aug/20/maribor-v-celtic-champions-league-play-off-live-report
      *
      * Seems pretty STRANGE.
      *
      * TODO: figure out if this is actually being used. If so, refactor it.
      */
    JsObject(Seq(k -> JsString(RelativePathEscaper.escapeLeadingSlashFootballPaths(v))))
  }
}
