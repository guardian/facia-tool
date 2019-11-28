package updates

import java.net.URI
import java.security.InvalidParameterException
import java.util.UUID

import com.gu.mobile.notifications.client.models.Importance.Importance
import com.gu.mobile.notifications.client.models.Topic._
import com.gu.mobile.notifications.client.models.TopicTypes.Breaking
import com.gu.mobile.notifications.client.models._
import conf.ApplicationConfiguration
import org.apache.commons.lang3.StringEscapeUtils
import logging.Logging
import play.api.libs.json._
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
    new BreakingNewsClientImpl(
      ws = ws,
      host = config.notification.host,
      apiKey = config.notification.key
    )
  }

  def putBreakingNewsUpdate(
    collectionId: String,
    collection: ClientHydratedCollection,
    email: String
  ): Future[Result] = {
    structuredLogger.putLog(LogUpdate(HandlingBreakingNewsCollection(collectionId), email))

    val futurePossibleErrors = Future.traverse(collection.trails)(trail => sendAlert(trail, email, collectionId).map(trail -> _))
    futurePossibleErrors.map { listOfPossibleErrors => {
      val errors = listOfPossibleErrors.collect { case(trail, Some(error)) => trail -> error }
      if (errors.isEmpty) {
        Ok
      } else {
        errors.foreach { case (trail, error) =>
          logger.error(s"Error sending breaking news. Returning to client: $error. Trail: $trail")
        }

        InternalServerError(Json.toJson(errors.map { case(_, error) => error }))
      }
    }}
  }

  private def sendAlert(trail: ClientHydratedTrail, email: String, collectionId: String): Future[Option[String]] = {
    def handleSuccessfulFuture(result: Either[ApiClientError, UUID]) = result match {
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
    val title = trail.topic match {
      case Some("uk-general-election") => Some("General election 2019")
      case _ => None
    }
    BreakingNewsPayload(
      title = title,
      message = Some(StringEscapeUtils.unescapeHtml4(trail.headline)),
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
      dryRun = None
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
      case Some("uk-general-election") => List(BreakingNewsElection)
      case Some("") => throw new InvalidParameterException(s"Invalid empty string topic")
      case Some(notYetImplementedTopic) => List(Topic(Breaking, notYetImplementedTopic))
      case None => throw new InvalidParameterException(s"Invalid empty topic")
    }
  }
}

case class ApiClientError(description: String)

trait BreakingNewsClient {
  def send(breakingNewsPayload: BreakingNewsPayload): Future[Either[ApiClientError, UUID]]
}

class BreakingNewsClientImpl(ws: WSClient, host: String, apiKey: String) extends BreakingNewsClient with Logging {

  private val url = s"$host/push/topic"

  override def send(breakingNewsPayload: BreakingNewsPayload): Future[Either[ApiClientError, UUID]] = {
    val body: String = Json.stringify(NotificationPayload.jf.writes(breakingNewsPayload))
    ws.url(url)
      .withHttpHeaders("Content-Type" -> "application/json; charset=UTF-8", "Authorization" -> s"Bearer $apiKey")
      .post(body)
      .map { response =>
        if (response.status >= 200 && response.status < 300) {
          logger.info("Breaking news notification sent correctly")
          response.body[JsValue] \ "id" match {
            case JsDefined(JsString(id)) => Right(UUID.fromString(id))
            case _ => Left(ApiClientError(s"Notification sent successfully but unable to parse response. Status: ${response.status}, Body: ${response.body}"))
          }
        } else {
          logger.error(s"Unable to send breaking news notification, Status ${response.status}: ${response.statusText}, Body: ${response.body}")
          Left(ApiClientError("Unable to send breaking news notification, status ${response.status}: ${response.statusText}"))
        }
      }
  }
}
