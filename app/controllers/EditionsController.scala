package controllers

import logging.Logging
import model.forms._
import play.api.libs.json.Json
import services.editions.{EditionsDB, EditionsTemplating}
import java.time.LocalDate

import model.editions.EditionsTemplates

import scala.concurrent.ExecutionContext
import scala.util.Try

class EditionsController(db: EditionsDB, templating: EditionsTemplating, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)  with Logging {

  def postIssue(name: String) = AccessAPIAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    templating.generateEditionTemplate(name, form.issueDate).map { skeleton =>
      val issueId = db.insertIssue(name, skeleton, req.user)

      db.getIssue(issueId).map { issue =>
        Created(Json.toJson(issue))
      }.getOrElse(NotFound("Issue created but could not retrieve it from the database"))
    }.getOrElse {
      NotFound(s"Edition $name not found")
    }
  }

  def getIssue(id: String)= AccessAPIAuthAction { req =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Edition $id not found"))
  }

  def getAvailableEditions = AccessAPIAuthAction { _ =>
    Ok(Json.toJson(EditionsTemplates.getAvailableEditions))
  }

  def listIssues(name: String) = AccessAPIAuthAction { req =>
    Try {
      val dateFrom = req.queryString.get("dateFrom").map(_.head).get
      val dateTo = req.queryString.get("dateTo").map(_.head).get
      (LocalDate.parse(dateFrom), LocalDate.parse(dateTo))
    }.map {
      case (localDateFrom, localDateTo) => {
        Ok(Json.toJson(db.listIssues(name, localDateFrom, localDateTo)))
      }
    }.getOrElse(BadRequest("Invalid or missing date"))
  }

  def getCollections() = AccessAPIAuthAction(parse.json[List[GetCollectionsFilter]]) { req =>
    Ok(Json.toJson(db.getCollections(req.body)))
  }
}
