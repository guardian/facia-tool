package updates

import java.net.URI
import java.security.InvalidParameterException

import com.gu.mobile.notifications.client._
import com.gu.mobile.notifications.client.models.Importance.Importance
import com.gu.mobile.notifications.client.models.Topic._
import com.gu.mobile.notifications.client.models.TopicTypes.Breaking
import com.gu.mobile.notifications.client.models._
import conf.ApplicationConfiguration
import logging.Logging
import org.apache.commons.lang3.StringEscapeUtils
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Result
import play.api.mvc.Results.{InternalServerError, Ok}
import util.{BreakingNewsClient, BreakingNewsRequest}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class InvalidNotificationContentType(msg: String) extends Throwable(msg) {}

class BreakingNewsUpdate(val config: ApplicationConfiguration, val ws: WSClient, val structuredLogger: StructuredLogger) extends Logging {
  lazy val client = {
    logger.info(s"Configuring breaking news client to send notifications to ${config.notification.host}")
    new BreakingNewsClient(
      host = config.notification.host,
      apiKey = config.notification.key,
      ws
    )
  }

  def putBreakingNewsUpdate(
    collectionId: String,
    collection: ClientHydratedCollection,
    email: String
  ): Future[Result] = {

    def structuredLog(update: UpdateMessage, level: String = "info", error: Option[String] = None) = {
      structuredLogger.putLog(LogUpdate(update, email), level, error.map(new Exception(_)))
    }

    structuredLog(HandlingBreakingNewsCollection(collectionId))

    val requests = createRequests(collection.trails, email)

    Future.traverse(requests) { request =>
      structuredLog(HandlingBreakingNewsTrail(collectionId, request.trail, request.topic.name))

      if(request.trail.alert.getOrElse(false)) {
        client.send(request).map(request -> _)
      } else {
        val errorMessage = "There has been a problem sending the breaking news alert. Please contact central production before sending additional alerts"
        structuredLog(SuppressedBreakingNewsSend(collectionId, request.trail, request.topic.name), level = "error", error = Some(errorMessage))

        // TODO MRB: use our own custom error enum rather than the MAPI client
        Future.successful(
          request -> Left(UnexpectedApiResponseError(errorMessage))
        )
      }
    }.map { results =>
      val successes = results.collect { case (request, Right(response)) => request -> response }
      val errors = results.collect { case (request, Left(error)) => request -> error }

      // We are currently not returning successful responses if there are any errors
      // Ideally the notifications API would allow us to send a Global notification in a single request
      if(errors.nonEmpty) {
        InternalServerError(Json.toJson(
          errors.map { case(request, error) =>
            structuredLog(HandlingBreakingNewsTrail(collectionId, request.trail, request.topic.name), level = "error", Some(error.description))
            error.description
          }
        ))
      } else {
        Ok(Json.toJson(
          successes.map { case(request, response) =>
            structuredLog(SentBreakingNewsNotification(collectionId, request.trail, request.topic.name, response.id))
            response.id
          }
        ))
      }
    }
  }

  private def createRequests(trails: List[ClientHydratedTrail], email: String): List[BreakingNewsRequest] = {
    trails.flatMap { trail =>
      // We send a Global notification as multiple notifications to each requested topic
      // This is because there is a limit of 3 topics at once in mobile-n10n and we currently have 4 global editions
      parseTopic(trail.topic).map { topic =>
        val payload = createPayload(trail, email, topic)
        BreakingNewsRequest(trail, topic, payload)
      }
    }
  }

  private def createPayload(trail: ClientHydratedTrail, email: String, topic: Topic): BreakingNewsPayload = {
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
      topic = List(topic),
      debug = false
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
