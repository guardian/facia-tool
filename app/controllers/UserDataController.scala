package controllers

import com.gu.facia.client.models.Trail
import com.gu.scanamo._
import com.gu.scanamo.syntax._
import services.{Dynamo, FrontsApi}
import model.UserData
import play.api.Logger

import scala.concurrent.{ExecutionContext, Future}

class UserDataController(frontsApi: FrontsApi, dynamo: Dynamo, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) {
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
    val maybeFrontIds: Option[List[String]] = request.body.asJson.flatMap(
      _.asOpt[List[String]])
    maybeFrontIds match {
      case Some(frontIds) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('frontIds -> frontIds)))
        Ok
      case _ => BadRequest
    }
  }

  def putFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFrontIdsByPriority match {
      case Some(frontIdsByPriority) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('frontIdsByPriority -> frontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def putFaveFrontIdsByPriority() = APIAuthAction { request =>
    val maybeFaveFrontIdsByPriority: Option[Map[String, List[String]]] = request.body.asJson.flatMap(
      _.asOpt[Map[String, List[String]]])
    maybeFaveFrontIdsByPriority match {
      case Some(faveFrontIdsByPriority) =>
        Scanamo.exec(dynamo.client)(userDataTable.update('email -> request.user.email, set('faveFrontIdsByPriority -> faveFrontIdsByPriority)))
        Ok
      case _ => BadRequest
    }
  }

  def migrateUserData() = AccessAPIAuthAction.async {
    val result = frontsApi.amazonClient.config.flatMap { config =>
      val maybeUserData = Scanamo.exec(dynamo.client)(userDataTable.scan)
      Future.successful(maybeUserData.filter(_.isRight).map {
        case Right(userData) =>
          val frontIds = userData.frontIds.getOrElse(List.empty[String])
          val frontIdsByPriority = frontIds.foldLeft(Map.empty[String, List[String]])((acc, frontId) => {
            val maybeAcc = for {
              front <- config.fronts.get(frontId)
            } yield {
              val priority = front.priority.getOrElse("editorial")
              val frontIdsByCurrentPriority = acc.getOrElse(priority, List.empty[String])
              acc + (priority -> (frontIdsByCurrentPriority :+ frontId))
            }
            maybeAcc.getOrElse(acc)
          })
          Scanamo.exec(dynamo.client)(userDataTable.update('email -> userData.email, set('frontIdsByPriority -> frontIdsByPriority)))
          Map(userData.email -> frontIdsByPriority)
      })
    }
    result.map(data => {
      Ok
    })
  }
}


