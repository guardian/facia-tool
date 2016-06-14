package controllers

import auth.PanDomainAuthActions
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient
import com.gu.scanamo.{Scanamo, Table}
import conf.ApplicationConfiguration
import play.api.mvc.Controller
import services.AwsEndpoints

case class FrontPressRecord(stageName: String, frontId: String, pressedTime: String)

class PressController (val config: ApplicationConfiguration, awsEndpoints: AwsEndpoints) extends Controller with PanDomainAuthActions {
  private lazy val client = {
    val client = new AmazonDynamoDBClient(config.aws.mandatoryCredentials)
    client.setEndpoint(awsEndpoints.dynamoDb)
    client
  }

  private lazy val pressedTable = config.faciatool.frontPressUpdateTable.map(Table[FrontPressRecord](_))

  def getLastModified (path: String) = APIAuthAction { request =>
    import com.gu.scanamo.syntax._

    val record: Option[FrontPressRecord] = pressedTable.flatMap { table =>
      Scanamo.exec(client)(
        table.get('stageName -> "live" and 'frontId -> path)).flatMap(_.toOption)
    }
    record.map(r => Ok(r.pressedTime)).getOrElse(NotFound)
  }
}
