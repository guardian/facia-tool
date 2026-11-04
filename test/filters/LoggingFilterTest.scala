package filters

import ch.qos.logback.classic.{Logger => LogbackLogger}
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.stream.Materializer
import org.scalatest.{BeforeAndAfterAll, FreeSpec, Matchers}
import org.slf4j.LoggerFactory
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.test.FakeRequest

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}
import scala.jdk.CollectionConverters._

class LoggingFilterTest extends FreeSpec with Matchers with BeforeAndAfterAll {
  implicit val system: ActorSystem = ActorSystem("logging-filter-test")
  implicit val mat: Materializer = Materializer(system)
  implicit val ec: ExecutionContext = system.dispatcher

  override def afterAll(): Unit = Await.result(system.terminate(), 5.seconds)

  private val filter = new LoggingFilter

  private def run(
      request: RequestHeader,
      next: RequestHeader => Future[Result]
  ) = {
    val logbackLogger =
      LoggerFactory
        .getLogger(classOf[LoggingFilter])
        .asInstanceOf[LogbackLogger]
    val appender = new ListAppender[ILoggingEvent]
    appender.start()
    logbackLogger.addAppender(appender)
    try {
      val result = Await.ready(filter(next)(request), 5.seconds).value.get
      (result, appender.list.asScala.toList)
    } finally logbackLogger.detachAppender(appender)
  }

  "LoggingFilter" - {
    "logs request details including origin, and passes a generated request ID downstream" in {
      var seenRequestId: Option[String] = None
      val request = FakeRequest("GET", "/some/path?foo=bar")
        .withHeaders(
          "X-Forwarded-For" -> "1.2.3.4",
          "User-Agent" -> "curl/8.5.0"
        )

      val (result, events) = run(
        request,
        r => {
          seenRequestId = r.headers.get("X-Request-Id")
          Future.successful(Results.Ok)
        }
      )

      result.isSuccess shouldBe true
      seenRequestId should not be empty
      events should have size 1
      val marker = events.head.getMarkerList.get(0).toString
      marker should include("origin=1.2.3.4")
      marker should include("userAgent=curl/8.5.0")
      marker should include("query_string.foo=bar")
      marker should include(s"requestId=${seenRequestId.get}")
    }

    "keeps an existing request ID" in {
      val request =
        FakeRequest("GET", "/").withHeaders("X-Request-Id" -> "abc-123")
      val (_, events) = run(request, _ => Future.successful(Results.Ok))
      events.head.getMarkerList.get(0).toString should include(
        "requestId=abc-123"
      )
    }

    "logs failed requests as errors and propagates the failure" in {
      val (result, events) =
        run(
          FakeRequest("GET", "/"),
          _ => Future.failed(new RuntimeException("boom"))
        )

      result.isFailure shouldBe true
      events.map(_.getLevel.toString) shouldBe List("ERROR")
      events.head.getMarkerList.get(0).toString should include("status=500")
    }
  }
}
