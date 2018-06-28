package controllers

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDB, AmazonDynamoDBClientBuilder}
import com.gu.facia.api.NotFound
import com.gu.facia.client.models.{MetaDataCommonFields, TrailMetaData}
import com.gu.scanamo.{Scanamo, Table}
import com.gu.scanamo.syntax._
import com.twitter.util.Activity.Ok
import play.api.libs.json.{Format, Json}
import services.Dynamo

case class ClipboardMetaData(headline: Option[String])

object ClipboardMetaData {
  implicit val jsonFormat = Json.format[ClipboardMetaData]
}

object ClipboardTrail {
  implicit val jsonFormat = Json.format[ClipboardTrail]
}

case class ClipboardTrail(id: String, meta: Option[ClipboardMetaData])

object ClipboardData {
  implicit val jsonFormat = Json.format[ClipboardData]
}
case class ClipboardData(email: String, articles: List[ClipboardTrail])


class ClipboardController(dynamo: Dynamo, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {

  private lazy val clipboardTable = Table[ClipboardData](config.faciatool.clipboardTable)

  def getClipboardContent() = APIAuthAction { request =>

    val userEmail = request.user.email

    val record: Option[ClipboardData] = Scanamo.exec(dynamo.client)(
      clipboardTable.get('email -> userEmail)).flatMap(_.right.toOption)

    record.map(clipboardContent => Ok(Json.toJson(clipboardContent.articles))).getOrElse(NotFound)
  }

  def putClipboardContent() = APIAuthAction { request =>

    val clipboardContent: Option[List[ClipboardTrail]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[ClipboardTrail]])

    clipboardContent match {
      case Some(articles) => {
        val userEmail = request.user.email
        val item = ClipboardData(request.user.email, articles)
        val result = Scanamo.put(dynamo.client)(config.faciatool.clipboardTable)(item)
        Ok
      }
      case None => BadRequest
    }
  }
}


