package model

import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import org.joda.time.{DateTime, DateTimeZone, Period}
import play.api.mvc.{Action, Request, Result}

import scala.concurrent.{ExecutionContext, Future}

object Cached {
  private val HTTPDateFormat = DateTimeFormat
    .forPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
    .withZone(DateTimeZone.UTC)
  implicit class DateTime2ToCommonDateFormats(date: DateTime) {
    lazy val toISODateTimeString: String =
      date.toString(ISODateTimeFormat.dateTime)
    lazy val toHttpDateTimeString: String = date.toString(HTTPDateFormat)
  }

  private val cacheableStatusCodes = Seq(200, 404)

  private val tenDaysInSeconds = 864000

  def apply(seconds: Int)(result: Result): Result = {
    if (cacheableStatusCodes.exists(_ == result.header.status))
      cacheHeaders(seconds, result)
    else result
  }

  private def cacheHeaders(seconds: Int, result: Result) = {
    val now = DateTime.now
    val expiresTime = now.plus(Period.seconds(seconds))
    val maxAge = seconds

    // NOTE, if you change these headers make sure they are compatible with our Edge Cache

    // see
    // http://tools.ietf.org/html/rfc5861
    // http://www.fastly.com/blog/stale-while-revalidate
    // http://docs.fastly.com/guides/22966608/40347813
    val staleWhileRevalidateSeconds = math.max(maxAge / 10, 1)
    val cacheControl =
      s"max-age=$maxAge, stale-while-revalidate=$staleWhileRevalidateSeconds, stale-if-error=$tenDaysInSeconds"
    result.withHeaders(
      "Surrogate-Control" -> cacheControl,
      "Cache-Control" -> cacheControl,
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString
    )
  }
}

object NoCache {
  def apply(result: Result): Result =
    result.withHeaders("Cache-Control" -> "no-cache", "Pragma" -> "no-cache")
}

case class NoCache[A](action: Action[A])(implicit ec: ExecutionContext)
    extends Action[A] {

  override def executionContext = ec
  override def apply(request: Request[A]): Future[Result] = {

    action(request) map { response =>
      response.withHeaders(
        ("Cache-Control", "no-cache, no-store, must-revalidate"),
        ("Pragma", "no-cache"),
        ("Expires", "0")
      )
    }
  }

  lazy val parser = action.parser
}
