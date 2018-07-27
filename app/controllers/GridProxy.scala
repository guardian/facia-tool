package controllers

import play.api.libs.json.{Json, Format}

import scala.concurrent.{ExecutionContext, Future}
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}

case class FrontUsageMetadata(addedBy: String, front: String)

object FrontUsageMetadata {
  implicit val jsonFromat: Format[FrontUsageMetadata] = Json.format[FrontUsageMetadata]
}

object GridUsageRequest {
  implicit val jsonFromat: Format[GridUsageRequest] = Json.format[GridUsageRequest]
}

case class GridUsageRequest(mediaId: String, containerId: String, usageId: String, usageStatus: String)

case class GridUsageData(mediaId: String, dateAdded: String, containerId: String, usageId: String, usageStatus: String, frontUsageMetadata: FrontUsageMetadata)

object GridUsageData {
  implicit val jsonFormat: Format[GridUsageData] = Json.format[GridUsageData]
}

class GridProxy(val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {

  def addUsage() = APIAuthAction.async { request =>

    val usageRequest = request.body.asJson.flatMap(jsValue => jsValue.asOpt[GridUsageRequest])
    usageRequest match {
      case Some(parsedRequest) => {

        val gridUrl = s"${config.media.usageUrl}/usages/front"

        val usageData = GridUsageData(parsedRequest.mediaId, new DateTime().toString(ISODateTimeFormat.dateTime), parsedRequest.containerId, parsedRequest.usageId,
          parsedRequest.usageStatus, FrontUsageMetadata(request.user.email, parsedRequest.containerId))

        val usageJson = Json.toJson(usageData)
        wsClient.url(gridUrl)
          .withHttpHeaders("X-Gu-Media-Key" -> config.media.key)
          .post(usageJson)
          .map { response => Ok(usageJson).as("application/json")}
      }
      case None => Future.successful(BadRequest)

    }
  }
}
