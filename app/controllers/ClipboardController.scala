package controllers

import com.gu.facia.api.NotFound
import com.gu.facia.client.models.Trail
import com.gu.scanamo._
import com.gu.scanamo.error.TypeCoercionError
import com.gu.scanamo.syntax._
import play.api.libs.json._
import services.Dynamo

import scala.util.{Failure, Success, Try}

object ClipboardData {
  implicit val jsonFormat = Json.format[ClipboardData]

  implicit val jsValueFormat: DynamoFormat[JsValue] = DynamoFormat.xmap[JsValue, String](
    x => Try(Json.parse(x)) match {
      case Success(y) => Right(y)
      case Failure(f) => Left(TypeCoercionError(f))
    }
  )(Json.stringify(_))
}
case class ClipboardData(email: String, articles: List[Trail])


class ClipboardController(dynamo: Dynamo, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  import ClipboardData._

  private lazy val clipboardTable = Table[ClipboardData](config.faciatool.clipboardTable)

  def getClipboardContent() = APIAuthAction { request =>

    val userEmail = request.user.email
    val value = Scanamo.exec(dynamo.client)(clipboardTable.get('email -> userEmail))

    val record: Option[ClipboardData] = Scanamo.exec(dynamo.client)(
      clipboardTable.get('email -> userEmail)).flatMap(_.right.toOption)

    record.map(clipboardContent => Ok(Json.toJson(clipboardContent.articles))).getOrElse(NotFound)
  }

  def putClipboardContent() = APIAuthAction { request =>

    val clipboardContent: Option[List[Trail]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

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


