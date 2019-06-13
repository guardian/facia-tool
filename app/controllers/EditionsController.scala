package controllers

import logging.Logging
import model.forms.CreateIssue
import play.api.libs.json.Json
import services.editions.{EditionTemplates, EditionsDB}
import java.time.LocalDate
import play.api.mvc._

import scala.concurrent.ExecutionContext

class EditionsController(db: EditionsDB, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)  with Logging {

  def postIssue(name: String) = AccessAPIAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    EditionTemplates.generateEditionTemplate(name, form.issueDate).map { template =>
      val issueId = db.insertIssue(name, template.issueDate, template, req.user)

      db.getIssue(name, issueId).map { issue =>
        Created(Json.toJson(issue))
      }.getOrElse(NotFound("Issue created but could not retrieve it from the database"))
    }.getOrElse {
      NotFound(s"Edition ${name} not found")
    }
  }

  def getIssue(name: String, id: String)= AccessAPIAuthAction { req =>
    db.getIssue(name, id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Edition $id not found"))
  }

  def getAvailableEditions = AccessAPIAuthAction { _ =>
    Ok(Json.toJson(EditionTemplates.getAvailableEditions))
  }

  def listIssues(name: String) = AccessAPIAuthAction { req =>

    try {
      val date = req.queryString.get("date").map(_.head).get
      val localDate = LocalDate.parse(date)
      Ok(Json.toJson(db.listIssues(name, localDate)))
    } catch {
      case e: Throwable => BadRequest
    }
  }
}
