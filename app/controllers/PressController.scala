package controllers

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDB, AmazonDynamoDBClientBuilder}
import com.gu.scanamo.{Scanamo, Table}
import play.api.libs.json.Json
import services.Dynamo
import com.gu.scanamo.syntax._

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

class PressController (client: AmazonDynamoDB, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  private lazy val pressedTable = Table[FrontPressRecord](config.faciatool.frontPressUpdateTable)

  def getLastModified (path: String) = AccessAPIAuthAction { request =>
    import com.gu.scanamo.syntax._

    val record: Option[FrontPressRecord] = Scanamo.exec(client)(
        pressedTable.get('stageName -> "live" and 'frontId -> path)).flatMap(_.right.toOption)
    record.map(r => Ok(r.pressedTime)).getOrElse(NotFound)
  }

  def getLastModifiedStatus (stage: String, path: String) = AccessAPIAuthAction { request =>
    import com.gu.scanamo.syntax._

    val record: Option[FrontPressRecord] = Scanamo.exec(client)(
      pressedTable.get('stageName -> stage and 'frontId -> path)).flatMap(_.right.toOption)
    record.map(r => Ok(Json.toJson(r))).getOrElse(NotFound)
  }
}
