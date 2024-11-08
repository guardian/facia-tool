package controllers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import org.scanamo.generic.auto.genericDerivedFormat
import org.scanamo.{Scanamo, Table}
import play.api.libs.json.{Json, OFormat}
import software.amazon.awssdk.services.dynamodb.DynamoDbClient

object FrontPressRecord {
  implicit val jsonFormat: OFormat[FrontPressRecord] =
    Json.format[FrontPressRecord]
}
case class FrontPressRecord(
    stageName: String,
    frontId: String,
    pressedTime: String,
    errorCount: Int,
    messageText: String,
    statusCode: String,
    actionTime: String
)

class PressController(
    client: DynamoDbClient,
    val deps: BaseFaciaControllerComponents
) extends BaseFaciaController(deps) {
  private lazy val pressedTable =
    Table[FrontPressRecord](config.faciatool.frontPressUpdateTable)

  def getLastModified(path: String) = AccessAPIAuthAction { request =>
    import org.scanamo.syntax._

    val record: Option[FrontPressRecord] = Scanamo(client)
      .exec(pressedTable.query("stageName" === "live" and "frontId" === path))
      .flatMap(_.toOption)
      .headOption
    record.map(r => Ok(r.pressedTime)).getOrElse(NotFound)
  }

  def getLastModifiedStatus(stage: String, path: String) = AccessAPIAuthAction {
    request =>
      import org.scanamo.syntax._

      val record: Option[FrontPressRecord] = Scanamo(client)
        .exec(pressedTable.query("stageName" === stage and "frontId" === path))
        .flatMap(_.toOption)
        .headOption
      record.map(r => Ok(Json.toJson(r))).getOrElse(NotFound)
  }
}
