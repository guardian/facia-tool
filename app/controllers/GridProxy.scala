package controllers

import play.api.libs.json.{Json, Format}

import scala.concurrent.{ExecutionContext, Future}
import org.joda.time.DateTime
import play.api.libs.json.JodaWrites._
import play.api.libs.json.JodaReads._

object FrontUsageData {
  implicit val jsonFromat: Format[FrontUsageData] = Json.format[FrontUsageData]
}

case class FrontUsageData(mediaId: String, front: String)

case class GridUsageData(
    dateAdded: DateTime,
    addedBy: String,
    front: String,
    mediaId: String
)

object GridUsageData {
  implicit val jsonFormat: Format[GridUsageData] = Json.format[GridUsageData]
}

case class GridUsageRequest(data: GridUsageData)

object GridUsageRequest {
  implicit val jsonFormat: Format[GridUsageRequest] =
    Json.format[GridUsageRequest]
}

class GridProxy(val deps: BaseFaciaControllerComponents)(implicit
    ec: ExecutionContext
) extends BaseFaciaController(deps) {

  def addUsage() = APIAuthAction.async { request =>
    val usageRequest =
      request.body.asJson.flatMap(jsValue => jsValue.asOpt[FrontUsageData])
    usageRequest match {
      case Some(parsedRequest) => {

        val gridUrl = s"${config.media.usageUrl}/usages/front"

        val usageRequest = GridUsageRequest(
          GridUsageData(
            DateTime.now,
            request.user.email,
            parsedRequest.front,
            parsedRequest.mediaId
          )
        )

        val usageJson = Json.toJson(usageRequest)
        wsClient
          .url(gridUrl)
          .withHttpHeaders("X-Gu-Media-Key" -> config.media.key)
          .post(usageJson)
          .map { response => Ok(usageJson).as("application/json") }
      }
      case None => Future.successful(BadRequest)

    }
  }
}
