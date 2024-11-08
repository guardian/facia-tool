package filters

import javax.inject.Inject
import scala.jdk.CollectionConverters._
import org.apache.pekko.stream.Materializer
import play.api.MarkerContext
import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}
import logging.Logging
import net.logstash.logback.marker.Markers.appendEntries

class LoggingFilter @Inject() (implicit
    val mat: Materializer,
    ec: ExecutionContext
) extends Filter
    with Logging {
  def apply(
      nextFilter: RequestHeader => Future[Result]
  )(requestHeader: RequestHeader): Future[Result] = {

    val startTime = System.currentTimeMillis

    nextFilter(requestHeader).map { result =>
      val endTime = System.currentTimeMillis
      val requestTime = endTime - startTime
      val message =
        s"${requestHeader.method} ${requestHeader.uri} took ${requestTime}ms and returned ${result.header.status}"
      val markerEntries = Map(
        "method" -> requestHeader.method,
        "url" -> requestHeader.uri,
        "requestTime" -> requestTime,
        "status" -> result.header.status
      )
      val logMarker = MarkerContext(appendEntries(markerEntries.asJava))

      result.header.status match {
        case status if (status >= 200 && status <= 399) =>
          logger.info(message)(logMarker)
        case _ =>
          logger.error(message)(logMarker)
      }

      result.withHeaders("Request-Time" -> requestTime.toString)
    }
  }
}
