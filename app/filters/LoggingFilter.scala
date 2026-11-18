package filters

import javax.inject.Inject
import scala.jdk.CollectionConverters._
import org.apache.pekko.stream.Materializer
import play.api.MarkerContext
import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}
import java.util.UUID
import logging.Logging
import net.logstash.logback.marker.Markers.appendEntries

object LoggingFilter {
  val requestIdHeader = "X-Request-Id"
}

class LoggingFilter @Inject() (implicit
    val mat: Materializer,
    ec: ExecutionContext
) extends Filter
    with Logging {
  def apply(
      nextFilter: RequestHeader => Future[Result]
  )(requestHeader: RequestHeader): Future[Result] = {

    val startTime = System.currentTimeMillis

    // Reuse an upstream request ID if there is one, so logs can be correlated
    val request =
      if (requestHeader.headers.hasHeader(LoggingFilter.requestIdHeader))
        requestHeader
      else
        requestHeader.withHeaders(
          requestHeader.headers
            .replace(
              LoggingFilter.requestIdHeader -> UUID.randomUUID().toString
            )
        )

    nextFilter(request).transform {
      case Success(result) =>
        val requestTime = System.currentTimeMillis - startTime
        log(request, Right(result), requestTime)
        Success(result.withHeaders("Request-Time" -> requestTime.toString))
      case Failure(err) =>
        log(request, Left(err), System.currentTimeMillis - startTime)
        Failure(err)
    }
  }

  private def log(
      request: RequestHeader,
      outcome: Either[Throwable, Result],
      requestTime: Long
  ): Unit = {
    val status = outcome.map(_.header.status).getOrElse(500)
    val message =
      s"${request.method} ${request.uri} took ${requestTime}ms and returned $status"

    val queryStringEntries = request.queryString.map { case (k, v) =>
      s"query_string.$k" -> v.mkString(", ")
    }
    val optionalEntries = Map(
      "referrer" -> request.headers.get("Referer"),
      "userAgent" -> request.headers.get("User-Agent"),
      "requestId" -> request.headers.get(LoggingFilter.requestIdHeader)
    ).collect { case (k, Some(v)) => k -> v }

    val markerEntries = Map(
      "method" -> request.method,
      "url" -> request.uri,
      "path" -> request.path,
      "requestTime" -> requestTime,
      "status" -> status,
      // X-Forwarded-For is client-controllable, so also log the socket address
      "origin" -> request.headers
        .get("X-Forwarded-For")
        .getOrElse(request.remoteAddress),
      "remoteAddress" -> request.remoteAddress
    ) ++ optionalEntries ++ queryStringEntries
    val logMarker = MarkerContext(appendEntries(markerEntries.asJava))

    outcome match {
      case Left(err) => logger.error(message, err)(logMarker)
      case Right(_) if status >= 400 || status < 200 =>
        logger.error(message)(logMarker)
      case Right(_) => logger.info(message)(logMarker)
    }
  }
}
