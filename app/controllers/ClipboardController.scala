package controllers

import com.gu.facia.api.NotFound
import com.gu.facia.client.models.Trail
import com.gu.scanamo._
import com.gu.scanamo.syntax._
import play.api.libs.json._
import services.Dynamo
import model.UserData

import scala.util.{Failure, Success, Try}


class ClipboardController(dynamo: Dynamo, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  import model.UserData._

  private lazy val userDataTable = Table[UserData](config.faciatool.userDataTable)

  def getClipboardContent() = APIAuthAction { request =>

    val userEmail: String = request.user.email

    val record: Option[UserData] = Scanamo.exec(dynamo.client)(
      userDataTable.get('email -> userEmail)).flatMap(_.right.toOption)

    record.map(clipboardContent => Ok(Json.toJson(clipboardContent.clipboardArticles))).getOrElse(NotFound)
  }

  def putClipboardContent() = APIAuthAction { request =>

    val clipboardContent: Option[List[Trail]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardContent match {
      case Some(articles) => {
        val userEmail = request.user.email
        val item = UserData(request.user.email, articles, List())
        val result = Scanamo.put(dynamo.client)(config.faciatool.userDataTable)(item)
        Ok
      }
      case None => BadRequest
    }
  }
}


