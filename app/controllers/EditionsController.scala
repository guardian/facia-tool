package controllers

import logging.Logging
import model.forms._
import play.api.libs.json.{JsObject, Json}
import services.editions.EditionsTemplating
import java.time.{LocalDate, OffsetDateTime}

import model.editions.{EditionsFrontMetadata, EditionsFrontendCollectionWrapper, EditionsTemplates}
import services.Capi
import services.editions.db.EditionsDB
import services.editions.publishing.EditionsPublishing
import services.editions.publishing.PublishedIssueFormatters._
import util.ContentUpgrade.rewriteBody
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class EditionsController(db: EditionsDB,
                         templating: EditionsTemplating,
                         publishing: EditionsPublishing,
                         capi: Capi,
                         val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)  with Logging {

  def postIssue(name: String) = AccessAPIAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    templating.generateEditionTemplate(name, form.issueDate).map { skeleton =>
      val issueId = db.insertIssue(name, skeleton, req.user, OffsetDateTime.now())

      db.getIssue(issueId).map { issue =>
        Created(Json.toJson(issue))
      }.getOrElse(NotFound("Issue created but could not retrieve it from the database"))
    }.getOrElse {
      NotFound(s"Edition $name not found")
    }
  }

  def getIssue(id: String)= AccessAPIAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getIssueSummary(id: String)= AccessAPIAuthAction { _ =>
    db.getIssueSummary(id).map { issue =>
      Ok(Json.toJson(issue).as[JsObject] - "fronts")
    }.getOrElse(NotFound(s"Issue $id not found"))
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

  // Ideally the frontend can be changed so we don't have this bonkers modelling!
  def getCollections() = AccessAPIAuthAction(parse.json[List[GetCollectionsFilter]]) { req =>
    val filters = req.body
    if (filters.isEmpty) {
      Ok(Json.toJson(List.empty[EditionsFrontendCollectionWrapper]))
    } else {
      Ok(Json.toJson(db.getCollections(filters).map(EditionsFrontendCollectionWrapper.fromCollection)))
    }

  }

  def updateCollection(collectionId: String) = AccessAPIAuthAction(parse.json[EditionsFrontendCollectionWrapper]) { req =>
    val form = req.body
    val collectionToUpdate = EditionsFrontendCollectionWrapper.toCollection(form)
    val updatedCollection = db.updateCollection(collectionToUpdate)
    for {
      issueId <- db.getIssueIdFromCollectionId(updatedCollection.id)
      issue <- db.getIssue(issueId)
    } {
      logger.info("Updating preview")
      publishing.updatePreview(issue)
    }
    Ok(Json.toJson(EditionsFrontendCollectionWrapper.fromCollection(updatedCollection)))
  }

  def getPreviewEdition(id: String) = AccessAPIAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue.toPublishedIssue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def publishIssue(id: String) = AccessAPIAuthAction { req =>
    db.getIssue(id).map { issue =>
      publishing.publish(issue, req.user, OffsetDateTime.now())
      NoContent
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getPrefillForCollection(id: String) = AccessAPIAuthAction.async { req =>
    db.getCollectionPrefillQueryString(id).map { prefillUpdate =>
      capi.getPrefillArticles(prefillUpdate.issueDate, prefillUpdate.prefill, prefillUpdate.currentPageCodes).map { body =>
        // Need to wrap this in a "response" object because the CAPI client and CAPI API return different JSON
        val json = "{\"response\":" + body.asJson.noSpaces + "}"
        val decorated = rewriteBody(json)
        Ok(decorated).as("application/json")
      }
    }.getOrElse(Future.successful(NotFound("Collection not found")))
  }

  def putFrontMetadata(id: String) = AccessAPIAuthAction(parse.json[EditionsFrontMetadata]) { req =>
    db.updateFrontMetadata(id, req.body)
    NoContent
  }
}
