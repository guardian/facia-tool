package services

import com.amazonaws.services.eventbridge.AmazonEventBridgeAsyncClient
import com.amazonaws.services.eventbridge.model.{PutEventsRequest, PutEventsRequestEntry, PutEventsResult}
import com.gu.facia.api.models.faciapress.PressType
import conf.ApplicationConfiguration
import play.api.libs.json.Json

import java.util.Date
import scala.concurrent.Future
import scala.util.Try

class EventBridge(config: ApplicationConfiguration) {
  val client = AmazonEventBridgeAsyncClient.asyncBuilder().build()

  def putEvent(path: String, pressType: PressType): Future[PutEventsResult] = {
    val requestEntry = new PutEventsRequestEntry()
      .withTime(new Date())
      .withEventBusName(config.faciatool.eventBridgeBusName)  // if we don't define this then we use the default event bus, can be referenced by name or arn
      .withSource("facia-tool") // could be used in the EventPattern to trigger only some Rules
      .withDetailType("front-update") // maybe superfluous? "used to decide what fields to expect in the event detail"
      .withDetail(EventBridgeDetail(path, pressType).toJsonString)

    val request = new PutEventsRequest()
      .withEntries(requestEntry)

    Future.fromTry(Try(client.putEvents(request)))
  }
}

case class EventBridgeDetail(path: String, pressType: PressType) {
  def toJsonString: String = {
    Json.toJson(this)(Json.writes[EventBridgeDetail]).toString
  }
}
