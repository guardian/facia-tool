package controllers

import logging.Logging
import model.forms._
import play.api.libs.json.{JsObject, Json}
import services.editions.EditionsTemplating
import java.time.{LocalDate, OffsetDateTime}

import model.editions.{Edition, EditionsFrontMetadata, EditionsFrontendCollectionWrapper, EditionsTemplates}
import services.editions.db.EditionsDB
import services.editions.publishing.EditionsPublishing
import services.editions.publishing.PublishedIssueFormatters._
import util.ContentUpgrade.rewriteBody
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._
import net.logstash.logback.marker.Markers
import play.api.Logger

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try
import scala.collection.JavaConverters._
import cats.syntax.either._
import play.api.mvc.Result
import services.Capi
import services.editions.prefills.PrefillParamsAdapter

class EditionsController(db: EditionsDB,
                         templating: EditionsTemplating,
                         publishing: EditionsPublishing,
                         capi: Capi,
                         val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps)  with Logging {

  def createIssue(name: String) = EditEditionsAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    val result = for {
      edition <- Either.fromOption[Result, Edition](Edition.withNameOption(name), NotFound(s"Edition $name not found"))
      skeleton <- templating.generateEditionTemplate(edition, form.issueDate)
      issueId = db.insertIssue(edition, skeleton, req.user, OffsetDateTime.now())
      issue <- Either.fromOption(db.getIssue(issueId), NotFound("Issue created but could not retrieve it from the database"))
    } yield issue

    result.fold(identity, issue => Created(Json.toJson(issue)))
  }

  def getIssue(id: String)= EditEditionsAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def deleteIssue(id: String) = EditEditionsAuthAction { req => {
    db.getIssue(id).map { issue => {
      val markers = Markers.appendEntries(Map (
        "id" -> id,
        "issueDate" -> issue.issueDate.toString,
        "user" -> req.user.email
      ).asJava)

      Logger.info(s"Deleting issue ${id}")(markers)
      db.deleteIssue(id)
      Accepted
    }}.getOrElse(NotFound(s"Issue $id not found"))
  }}

  def getIssueSummary(id: String)= EditEditionsAuthAction { _ =>
    db.getIssueSummary(id).map { issue =>
      Ok(Json.toJson(issue).as[JsObject] - "fronts")
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getVersions(id: String) = AccessAPIAuthAction { _ =>
    db.getIssue(id)
      .map(_ => Ok(Json.toJson(db.getIssueVersions(id))))
      .getOrElse(NotFound(s"Issue $id not found"))
  }

  def getAvailableEditions = EditEditionsAuthAction { _ =>
    Ok(Json.toJson(EditionsTemplates.getAvailableEditions))
  }

  def listIssues(edition: Edition) = EditEditionsAuthAction { req =>
    Try {
      val dateFrom = req.queryString.get("dateFrom").map(_.head).get
      val dateTo = req.queryString.get("dateTo").map(_.head).get
      (LocalDate.parse(dateFrom), LocalDate.parse(dateTo))
    }.map {
      case (localDateFrom, localDateTo) => {
        Ok(Json.toJson(db.listIssues(edition, localDateFrom, localDateTo)))
      }
    }.getOrElse(BadRequest("Invalid or missing date"))
  }

  // Ideally the frontend can be changed so we don't have this bonkers modelling!
  def getCollections() = EditEditionsAuthAction(parse.json[List[GetCollectionsFilter]]) { req =>
    val filters = req.body
    if (filters.isEmpty) {
      Ok(Json.toJson(List.empty[EditionsFrontendCollectionWrapper]))
    } else {
      Ok(Json.toJson(db.getCollections(filters).map(EditionsFrontendCollectionWrapper.fromCollection)))
    }

  }

  def updateCollection(collectionId: String) = EditEditionsAuthAction(parse.json[EditionsFrontendCollectionWrapper]) { req =>
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

  def getPreviewEdition(id: String) = EditEditionsAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue.toPreviewIssue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def publishIssue(id: String) = EditEditionsAuthAction { req =>
    db.getIssue(id).map { issue =>
      publishing.publish(issue, req.user, OffsetDateTime.now())
      NoContent
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getPrefillForCollection(id: String) = EditEditionsAuthAction.async { req =>
    db.getCollectionPrefillQueryString(id).map { prefillUpdate =>
      import prefillUpdate._
      val prefillParams = PrefillParamsAdapter(issueDate, prefill, edition)
      capi.getPrefillArticles(prefillParams, prefillUpdate.currentPageCodes).map { body =>
        // Need to wrap this in a "response" object because the CAPI client and CAPI API return different JSON
        val json = "{\"response\":" + body.asJson.noSpaces + "}"
        val decorated = rewriteBody(json)
        Ok(decorated).as("application/json")
      }
    }.getOrElse(Future.successful(NotFound("Collection not found")))
  }

  def putFrontMetadata(id: String) = EditEditionsAuthAction(parse.json[EditionsFrontMetadata]) { req =>
    Ok(Json.toJson(db.updateFrontMetadata(id, req.body)))
  }

  def putFrontHiddenState(id: String, state: Boolean) = EditEditionsAuthAction { req =>
    db.updateFrontHiddenState(id, state).map { state =>
      Ok(Json.toJson(state))
    } getOrElse NotFound(s"Front $id not found")
  }
}
