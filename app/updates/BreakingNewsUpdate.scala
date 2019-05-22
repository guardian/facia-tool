package updates

import java.net.URI
import java.security.InvalidParameterException

import com.gu.mobile.notifications.client._
import com.gu.mobile.notifications.client.models.Importance.Importance
import com.gu.mobile.notifications.client.models.Topic._
import com.gu.mobile.notifications.client.models.TopicTypes.Breaking
import com.gu.mobile.notifications.client.models._
import conf.ApplicationConfiguration
import org.apache.commons.lang3.StringEscapeUtils
import logging.Logging
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Result
import play.api.mvc.Results.{InternalServerError, Ok}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.control.NonFatal
import scala.util.{Failure, Success, Try}


class InvalidNotificationContentType(msg: String) extends Throwable(msg) {}

class BreakingNewsUpdate(val config: ApplicationConfiguration, val ws: WSClient, val structuredLogger: StructuredLogger) extends Logging {
  lazy val client = {
    logger.info(s"Configuring breaking news client to send notifications to ${config.notification.host}")
    ApiClient(
      host = config.notification.host,
      apiKey = config.notification.key,
      httpProvider = new NotificationHttpProvider(ws)
    )
  }

  def putBreakingNewsUpdate(
    collectionId: String,
    collection: ClientHydratedCollection,
    email: String
  ): Future[Result] = {
    structuredLogger.putLog(LogUpdate(HandlingBreakingNewsCollection(collectionId), email))
    val futurePossibleErrors = Future.traverse(collection.trails)(trail => sendAlert(trail, email, collectionId))
    futurePossibleErrors.map { listOfPossibleErrors => {
      val errors = listOfPossibleErrors.flatten
      if (errors.isEmpty) Ok
      else InternalServerError(Json.toJson(errors))
    }}
  }

  private def sendAlert(trail: ClientHydratedTrail, email: String, collectionId: String): Future[Option[String]] = {
    def handleSuccessfulFuture(result: Either[ApiClientError, Unit]) = result match {
      case Left(error) =>
        structuredLogger.putLog(LogUpdate(HandlingBreakingNewsCollection(collectionId), email), "error", Some(new Exception(error.description)))
        Some(error.description)
      case Right(_) => None
    }
    def withExceptionHandling(block: => Future[Option[String]]): Future[Option[String]] = {
      Try(block) match {
        case Success(futureMaybeError) => futureMaybeError
        case Failure(t: Throwable) =>
          val message = s"Exception in breaking news client send for trail ${trail.headline} because ${t.getMessage}"
          logger.error(message, t)
          Future.successful(Some(message))}
    }

    if (trail.alert.getOrElse(false)) {
      withExceptionHandling({
        structuredLogger.putLog(LogUpdate(HandlingBreakingNewsTrail(collectionId, trail: ClientHydratedTrail), email))
        client.send(createPayload(trail, email))
          .map(handleSuccessfulFuture)
          .recover {
            case NonFatal(e) => Some(e.getMessage)
          }
      })
    } else {
      logger.error(s"Failed to send a breaking news alert for trail ${trail} because alert was missing")
      Future.successful(Some("There may have been a problem in sending a breaking news alert. Please contact central production for information"))
    }
  }

  private def createPayload(trail: ClientHydratedTrail, email: String): BreakingNewsPayload = {
    BreakingNewsPayload(
      message = StringEscapeUtils.unescapeHtml4(trail.headline),
      thumbnailUrl = trail.thumb.map{new URI(_)},
      sender = email,
      link = createLinkDetails(trail),
      imageUrl = trail.imageHide match {
        case Some(true) => None
        case _ => trail.image.map{new URI(_)}
      },
      importance = parseImportance(trail.group),
      topic =  parseTopic(trail.topic),
      debug = false,
      dryRun = Some(false)
    )
  }

  private def createLinkDetails(trail: ClientHydratedTrail) = {
    if (trail.isArticle) {
      GuardianLinkDetails(
        contentApiId = trail.path.getOrElse(throw new InvalidParameterException(s"Missing content API id for ${trail.headline}")),
        title = trail.headline,
        git = GITContent,
        thumbnail = trail.thumb,
        shortUrl = trail.shortUrl
      )
    } else {
      throw new InvalidNotificationContentType(s"Can't send snap notifications for trail: ${trail.headline}")
    }
  }

  private def parseImportance(name: Option[String]): Importance = {
    name match {
      case Some("major") => Importance.Major
      case Some("minor") => Importance.Minor
      case Some("") => Importance.Minor
      case Some(importance) => throw new InvalidParameterException(s"Invalid importance $importance")
      case None => Importance.Minor
    }
  }

  private def parseTopic(topic: Option[String]): List[Topic] = {
    topic match {
      case Some("global") => List(BreakingNewsUk, BreakingNewsUs, BreakingNewsAu, BreakingNewsInternational)
      case Some("au") => List(BreakingNewsAu)
      case Some("international") => List(BreakingNewsInternational)
      case Some("uk") => List(BreakingNewsUk)
      case Some("us") => List(BreakingNewsUs)
      case Some("sport") => List(BreakingNewsSport)
      case Some("") => throw new InvalidParameterException(s"Invalid empty string topic")
      case Some(notYetImplementedTopic) => List(Topic(Breaking, notYetImplementedTopic))
      case None => throw new InvalidParameterException(s"Invalid empty topic")
    }
  }
}

class NotificationHttpProvider(val ws: WSClient) extends HttpProvider with Logging {
  override def post(url: String, apiKey: String, contentType: ContentType, body: Array[Byte]): Future[HttpResponse] = {
    ws.url(url)
      .withHttpHeaders("Content-Type" -> s"${contentType.mediaType}; charset=${contentType.charset}", "Authorization" -> s"Bearer $apiKey")
      .post(body)
      .map(extract)
  }

  override def get(url: String): Future[HttpResponse] = ws.url(url).get().map(extract)

  private def extract(response: WSResponse): HttpResponse = {
    if (response.status >= 200 && response.status < 300) {
      logger.info("Breaking news notification sent correctly")
      HttpOk(response.status, response.body)
    } else {
      logger.error(s"Unable to send breaking news notification, status ${response.status}: ${response.statusText}")
      HttpError(response.status, response.body)
    }
  }
}
