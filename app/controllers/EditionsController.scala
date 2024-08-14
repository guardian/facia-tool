package controllers

import java.time.{LocalDate, OffsetDateTime}
import cats.syntax.either._
import com.gu.contentapi.json.CirceEncoders._
import io.circe.syntax._
import logging.Logging
import logic.EditionsChecker
import model.editions._
import model.editions.templates.{CuratedPlatformDefinition, EditionType}
import model.forms._
import net.logstash.logback.marker.Markers
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.Result
import services.Capi
import services.editions.EditionsTemplating
import services.editions.db.EditionsDB
import services.editions.prefills.{CapiPrefillTimeParams, MetadataForLogging, PrefillParamsAdapter}
import services.editions.publishing.Publishing
import services.editions.publishing.PublishedIssueFormatters._
import util.ContentUpgrade.rewriteBody
import util.{SearchResponseUtil, UserUtil}

import scala.jdk.CollectionConverters._
import scala.concurrent.ExecutionContext
import scala.util.Try
import model.editions.client.EditionsFrontendCollectionWrapper

class EditionsController(db: EditionsDB,
                         templating: EditionsTemplating,
                         publishing: Publishing,
                         capi: Capi,
                         val deps: BaseFaciaControllerComponents)(implicit ec: ExecutionContext) extends BaseFaciaController(deps) with Logging {

  def createIssue(name: String) = EditEditionsAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    val result = for {
      edition <- Either.fromOption[Result, Edition](Edition.withNameOption(name), NotFound(s"Edition $name not found"))
      templateResult <- templating.generateEditionTemplate(edition, form.issueDate)
      issueId = db.insertIssue(edition, templateResult.issueSkeleton, req.user, OffsetDateTime.now())
      issue <- Either.fromOption(db.getIssue(issueId), NotFound("Issue created but could not retrieve it from the database"))
    } yield issue

    result.fold(identity, issue => Created(Json.toJson(issue)))
  }

  def createIssueFromPreviousIssue(name: String) = EditEditionsAuthAction(parse.json[CreateIssue]) { req =>
    val form = req.body

    val result = for {
      edition <- Either.fromOption[Result, Edition](Edition.withNameOption(name), NotFound(s"Edition $name not found"))
      previousIssue <- db.getIssue(edition, form.issueDate).toRight(NotFound(s"Previous issue not found"))
      issueId = db.insertIssue(edition, previousIssue.toSkeleton, req.user, OffsetDateTime.now())
      issue <- Either.fromOption(db.getIssue(issueId), NotFound("Issue created but could not retrieve it from the database"))
    } yield issue

    result.fold(identity, issue => Created(Json.toJson(issue)))
  }

  def getIssue(id: String) = EditEditionsAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def deleteIssue(id: String) = EditEditionsAuthAction { req => {
    db.getIssue(id).map { issue => {
      val markers = Markers.appendEntries(Map(
        "id" -> id,
        "issueDate" -> issue.issueDate.toString,
        "user" -> req.user.email
      ).asJava)

      logger.info(s"Deleting issue ${id}")(markers)
      db.deleteIssue(id)
      Accepted
    }
    }.getOrElse(NotFound(s"Issue $id not found"))
  }
  }

  def getIssueSummary(id: String) = EditEditionsAuthAction { _ =>
    db.getIssueSummary(id).map {
      case Right(issue) => Ok(Json.toJson(issue).as[JsObject] - "fronts")
      case Left(error) => InternalServerError(error)
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getVersions(id: String) = AccessAPIAuthAction { _ =>
    db.getIssue(id)
      .map(_ => Ok(Json.toJson(db.getIssueVersions(id))))
      .getOrElse(NotFound(s"Issue $id not found"))
  }

  def getLastProofedVersion(id: String) = AccessAPIAuthAction { _ =>
    db.getIssue(id)
      .map(_ => Ok(Json.toJson(db.getLastProofedIssueVersion(id))))
      .getOrElse(NotFound(s"Issue $id not found"))
  }

  def republishEditionsAppEditionsList = EditEditionsAuthAction { _ => {
    try {
      //TODO: Make this a case class and serialise it properly
      val raw = Json.toJson(Map("action" -> "editionList")).as[JsObject] + ("content", Json.toJson(EditionsAppTemplates.getAvailableEditionsAppTemplates))
      publishing.putEditionsList(raw.toString())
      Ok("Published.  Please check processing has succeeded.")
    } catch {
      case e: Exception => InternalServerError(e.getMessage)
    }
  }}

  def getAvailableEditions = EditEditionsAuthAction { _ => {
    Ok(Json.toJson(getAvailableCuratedPlatformEditions))
  }}

  def checkIssue(id: String) = EditEditionsAuthAction { _ =>
    val maybeIssue = db.getIssue(id)
    maybeIssue match {
      case Some(issue) => Ok(Json.toJson(EditionsChecker.checkIssue(issue)))
      case _ => BadRequest("Unknown issue")
    }
  }

  def listIssues(edition: Edition) = EditEditionsAuthAction { req =>
    Try {
      val dateFrom = req.queryString.get("dateFrom").map(_.head).get
      val dateTo = req.queryString.get("dateTo").map(_.head).get
      (LocalDate.parse(dateFrom), LocalDate.parse(dateTo))
    }.map {
      case (localDateFrom, localDateTo) =>
        db.listIssues(edition, localDateFrom, localDateTo) match {
          case Right(issues) => Ok(Json.toJson(issues))
          case Left(errors) => InternalServerError(s"Error listing issues: ${errors.mkString(", ")}")
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

  def getCollection(collectionId: String) = EditEditionsAuthAction { req =>
    val collection = db.getCollections(List(GetCollectionsFilter(id = collectionId, None)))

    if(collection.isEmpty) {
      logger.warn(s"Collection not found ${collectionId}")
      NotFound(s"Collection $collectionId not found")
    } else {
      Ok(Json.toJson(EditionsFrontendCollectionWrapper.fromCollection(collection.head)))
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

  def renameCollection(collectionId: String) = EditEditionsAuthAction(parse.json[EditionsFrontendCollectionWrapper]) { req =>
    logger.info(s"Renaming collection ${collectionId}")

    val collection = db.getCollections(List(GetCollectionsFilter(id = collectionId, None)))

    if(collection.isEmpty) {
      logger.warn(s"Collection not found ${collectionId}")
      NotFound(s"Collection $collectionId not found")
    } else {
      val updatingCollection = collection.head.copy(
        displayName = req.body.collection.displayName,
        updatedBy = Some(UserUtil.getDisplayName(req.user)),
        updatedEmail = Some(req.user.email)
      )

      val updatedCollection = db.updateCollectionName(updatingCollection)
      Ok(Json.toJson(EditionsFrontendCollectionWrapper.fromCollection(updatedCollection)))
    }
  }

  def getPreviewEdition(id: String) = EditEditionsAuthAction { _ =>
    db.getIssue(id).map { issue =>
      Ok(Json.toJson(issue.toPreviewIssue))
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def proofIssue(id: String) = EditEditionsAuthAction { req =>
    db.getIssue(id).map { issue =>
      publishing.proof(issue, req.user, OffsetDateTime.now())
      NoContent
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def publishIssue(id: String, version: EditionIssueVersionId) = EditEditionsAuthAction { req =>
    val lastProofedIssueVersion = db.getLastProofedIssueVersion(id)

    db.getIssue(id).map { issue =>
      // Protect against stale requests, if our output platform supports proofing
      if(issue.supportsProofing && !lastProofedIssueVersion.exists(_.equals(version))) {
        BadRequest(s"Last proofed version of issue '${id}' is '${lastProofedIssueVersion.getOrElse("none")}', not '${version}'")
      } else {
        publishing.publish(issue, req.user, version)
      }
      NoContent
    }.getOrElse(NotFound(s"Issue $id not found"))
  }

  def getPrefillForCollection(id: String) = EditEditionsAuthAction { req =>
    db.getCollectionPrefill(id).map { prefillUpdate =>
      logger.info(s"getPrefillForCollection id=$id, prefillUpdate")
      import prefillUpdate._
      val capiDateQueryParam = EditionsAppTemplates.templates(edition).template.capiDateQueryParam
      val capiPrefillTimeParams = CapiPrefillTimeParams(capiQueryTimeWindow, capiDateQueryParam)
      // TODO
      // when we click (suggest articles) for collection we are not using ophan metrics and we are not sorting on them
      // we should converge that
      val getPrefillParams = PrefillParamsAdapter(
        issueDate,
        capiPrefillQuery,
        capiPrefillTimeParams,
        maybeOphanPath = None,
        maybeOphanQueryPrefillParams = None,
        edition,
        metadataForLogging = MetadataForLogging(issueDate, collectionId = Some(id), collectionName = None)
      )


      val responses = capi.getPrefillArticles(getPrefillParams, prefillUpdate.currentPageCodes)

      /**
       * TODO
       * aggregating results from multiple SearchResponses into single SearchResponse
       * Is a quick temp solution to be able to handle pagination on Suggest Articles request
       * currently result item from SearchResponse.results is a dynamic type which is enhanced by rewriteBody function
       * see rewriteBody function implementation
       * rewriteBody dynamically adjust Content type from SearchResponse into type CapiArticle type used on Front-end
       * making that type safe will require more work and will be done later
       */

      val responseWithAggregatedResults = SearchResponseUtil.aggregateResults(responses)

      val json = "{\"response\":" + responseWithAggregatedResults.asJson.noSpaces + "}"
      val decorated = rewriteBody(json)
      Ok(decorated).as("application/json")
    }.getOrElse(NotFound("Collection not found"))
  }

  def putFrontMetadata(id: String) = EditEditionsAuthAction(parse.json[EditionsFrontMetadata]) { req =>
    Ok(Json.toJson(db.updateFrontMetadata(id, req.body)))
  }

  def putFrontHiddenState(id: String, state: Boolean) = EditEditionsAuthAction { req =>
    db.updateFrontHiddenState(id, state).map { state =>
      Ok(Json.toJson(state))
    } getOrElse NotFound(s"Front $id not found")
  }

  def addCollectionToFront(id: String) = EditEditionsAuthAction { req =>
    db.addCollectionToFront(
      frontId = id,
      user = req.user,
      now = OffsetDateTime.now(),
      name = req.queryString.get("name").flatMap(_.headOption)
    ) match {
      case Right(front) => Ok(Json.toJson(front))
      case Left(EditionsDB.NotFoundError(message)) => NotFound
      case Left(error) => InternalServerError(error.getMessage())
    }
  }

  def removeCollectionFromFront(frontId: String, collectionId: String) = EditEditionsAuthAction { req =>
    db.removeCollectionFromFront(
      frontId = frontId,
      collectionId,
      user = req.user,
      now = OffsetDateTime.now()
    ) match {
      case Right(front) => Ok(Json.toJson(front))
      case Left(EditionsDB.NotFoundError(message)) => NotFound
      case Left(error) => InternalServerError(error.getMessage())
    }
  }

  private def getAvailableCuratedPlatformEditions: Map[String, List[CuratedPlatformDefinition]] = {
    val feastAppEditions = FeastAppTemplates.getAvailableTemplates

    EditionsAppTemplates.getAvailableEditionsAppTemplates ++ Map(
      "feastEditions" -> feastAppEditions,
    )
  }

}
