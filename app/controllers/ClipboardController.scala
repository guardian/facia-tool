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


  def putClipboardContent() = APIAuthAction { request =>

    val clipboardArticles: Option[List[Trail]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardArticles match {
      case Some(articles) => {
        val userEmail = request.user.email
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('clipboardArticles -> articles)))
        //val item = UserData(request.user.email, articles, List())
        //val result = Scanamo.put(dynamo.client)(config.faciatool.userDataTable)(item)
        Ok
      }
      case None => BadRequest
    }
  }
}


