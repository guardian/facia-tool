package controllers

import logging.Logging
import model.forms.CreateIssue
import play.api.libs.json.Json
import services.editions.{EditionTemplates, EditionsDB}

import scala.concurrent.ExecutionContext

class EditionsController(db: EditionsDB, val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)  with Logging {

  def postIssue = AccessAPIAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    EditionTemplates.generateEditionTemplate(form.name, form.publishDate).map { template =>
      val issueId = db.insertIssue(form.name, form.publishDate, template, req.user)

      db.getIssue(issueId).map { issue =>
        Created(Json.toJson(issue))
      }.getOrElse(NotFound("Issue created but could not retrieve it from the database"))
    }.getOrElse {
      NotFound(s"Edition ${form.name} not found")
    }
  }

  def getIssue(id: String)= AccessAPIAuthAction { req =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Edition $id not found"))
  }

  def getAvailableEditions = AccessAPIAuthAction { _ =>
    Ok(Json.toJson(EditionTemplates.getAvailableEditions))
  }
}
