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
      db.insertIssue(form.name, form.publishDate, template, req.user)
      Created
    }.getOrElse {
      NotFound(s"Edition ${form.name} not found")
    }
  }

  def getAvailableEditions = AccessAPIAuthAction { _ =>
    Ok(Json.toJson(EditionTemplates.getAvailableEditions))
  }
}
