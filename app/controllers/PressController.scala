package controllers

import auth.PanDomainAuthActions
import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDB, AmazonDynamoDBClientBuilder}
import com.gu.scanamo.{Scanamo, Table}
import conf.ApplicationConfiguration
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.Controller
import services.AwsEndpoints

object FrontPressRecord {
  implicit val jsonFormat = Json.format[FrontPressRecord]
}
case class FrontPressRecord (
 stageName: String,
 frontId: String,
 pressedTime: String,
 errorCount: Int,
 messageText: String,
 statusCode: String,
 actionTime: String
)

class PressController (awsEndpoints: AwsEndpoints, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  private lazy val client: AmazonDynamoDB = {
    val endpoint = new AwsClientBuilder.EndpointConfiguration(awsEndpoints.dynamoDb, config.aws.region)
    val builder: AmazonDynamoDBClientBuilder = AmazonDynamoDBClientBuilder.standard()
      .withCredentials(config.aws.cmsFrontsAccountCredentials)
      .withEndpointConfiguration(endpoint)
    builder.build()
  }

  private lazy val pressedTable = Table[FrontPressRecord](config.faciatool.frontPressUpdateTable)

  def getLastModified (path: String) = APIAuthAction { request =>
    import com.gu.scanamo.syntax._

    val record: Option[FrontPressRecord] = Scanamo.exec(client)(
        pressedTable.get('stageName -> "live" and 'frontId -> path)).flatMap(_.right.toOption)
    record.map(r => Ok(r.pressedTime)).getOrElse(NotFound)
  }

  def getLastModifiedStatus (stage: String, path: String) = APIAuthAction { request =>
    import com.gu.scanamo.syntax._

    val record: Option[FrontPressRecord] = Scanamo.exec(client)(
      pressedTable.get('stageName -> stage and 'frontId -> path)).flatMap(_.right.toOption)
    record.map(r => Ok(Json.toJson(r))).getOrElse(NotFound)
  }
}
