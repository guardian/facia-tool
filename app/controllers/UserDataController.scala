package controllers

import com.gu.facia.client.models.Trail
import com.gu.scanamo._
import com.gu.scanamo.syntax._
import services.Dynamo
import model.UserData

class UserDataController(dynamo: Dynamo, val deps: BaseFaciaControllerComponents) extends BaseFaciaController(deps) {
  import model.UserData._

  private lazy val userDataTable = Table[UserData](config.faciatool.userDataTable)


  def putClipboardContent() = APIAuthAction { request =>

    val clipboardArticles: Option[List[Trail]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[Trail]])

    clipboardArticles match {
      case Some(articles) => {
        val userEmail = request.user.email
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('clipboardArticles -> articles)))
        Ok
      }
      case None => BadRequest
    }
  }

  def putFrontIds() = APIAuthAction { request =>

    val frontIds: Option[List[String]] = request.body.asJson.flatMap(jsValue =>
      jsValue.asOpt[List[String]])

    frontIds match {
      case Some(ids) => {
        val userEmail = request.user.email
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('frontIds -> ids)))
        Ok
      }
      case None => BadRequest
    }
  }
}


