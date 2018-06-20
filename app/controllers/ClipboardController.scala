package controllers

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDBClientBuilder, AmazonDynamoDB}
import com.gu.facia.api.NotFound
import com.gu.facia.client.models.TrailMetaData
import com.gu.scanamo.{Scanamo, Table}
import com.gu.scanamo.syntax._
import com.twitter.util.Activity.Ok
import play.api.libs.json.{Format, Json}
import services.Dynamo

object ClipboardData {
  implicit val jsonFormat = Json.format[ClipboardData]
}
case class ClipboardData(email: String, articles: List[String])


class ClipboardController(dynamo: Dynamo, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  private lazy val clipboardTable = Table[ClipboardData](config.faciatool.clipboardTable)

  def getClipboardContent() = APIAuthAction { request =>

    val userEmail = request.user.email

    val record: Option[ClipboardData] = Scanamo.exec(dynamo.client)(
      clipboardTable.get('email -> userEmail)).flatMap(_.right.toOption)
    
    record.map(clipboardContent => Ok(Json.toJson(clipboardContent.articles))).getOrElse(NotFound)
  }


}


