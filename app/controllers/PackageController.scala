package controllers

import logging.Logging
import model.packages.PackageMetadata._
import model.packages.client.ClientPackage.toPackage
import model.packages.client.UpdateRegionsRequest._
import model.packages.{
  FeastPackageMetadata,
  PackageMetadata,
  WebPackageMetadata
}
import model.packages.client.{
  ClientPackage,
  ClientPackageHeader,
  CreatePackageRequest,
  UpdateRegionsRequest
}
import org.postgresql.util.PSQLException
import services.Capi
import services.editions.db.FaciaDB
import services.editions.publishing.Publishing
import play.api.libs.json._

import java.nio.charset.{
  CharacterCodingException,
  CodingErrorAction,
  MalformedInputException,
  StandardCharsets
}
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class PackageController(
    db: FaciaDB,
    publishing: Publishing,
    capi: Capi,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {
  private def toUuid(str: String): Option[UUID] = Try {
    UUID.fromString(str)
  }.toOption

  private def dateFormatter = DateTimeFormatter.BASIC_ISO_DATE

  def listPackages = EditEditionsAuthAction { req =>
    val idList = req
      .getQueryString("id")
      .map(_.split(",").toSeq)
      .map(_.map(toUuid).collect({ case Some(uuid) => uuid }))
    val full = req.getQueryString("full").isDefined

    val maybeDate =
      req.getQueryString("date").map(OffsetDateTime.parse(_, dateFormatter))
    val strictDate = req.getQueryString("strict").isDefined

    try {
      val pkgs = db.getPackages(idList, maybeDate, strictDate)
      if (full) {
        val clientPkgs = pkgs.map { pkg =>
          val cards = db
            .getPackageCards(java.util.UUID.fromString(pkg.id))
            .map(model.packages.client.ClientPackageCard.fromPackageCard)
            .toList
          ClientPackage.fromPackage(pkg, cards)
        }

        Ok(
          Json.obj(
            "status" -> JsString("ok"),
            "packages" -> JsArray(clientPkgs.map(ClientPackage.format.writes))
          )
        )
      } else {
        val clientPkgs = pkgs.map(ClientPackageHeader.fromPackage)
        Ok(
          Json.obj(
            "status" -> JsString("ok"),
            "packages" -> JsArray(
              clientPkgs.map(ClientPackageHeader.format.writes)
            )
          )
        )
      }
    } catch {
      case err: PSQLException =>
        logger.error(s"Could not list packages: ${err.getMessage}", err)
        psqlErrorHandler(err)
      case err: Throwable =>
        logger.error(s"Could not list packages: ${err.getMessage}", err)
        InternalServerError(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString(
              err.getMessage
            ) // TODO - tighten this up when we are done testing
          )
        )
    }
  }

  private def psqlErrorHandler(err: PSQLException) =
    err.getSQLState match {
      // See https://www.postgresql.org/docs/current/errcodes-appendix.html for a list of codes
      case "23505" => // unique constraint violation
        Conflict(
          Json.obj(
            "status" -> "conflict",
            "detail" -> "Cannot overwrite existing object"
          )
        )
      case "23503" => // foreign key violation
        Conflict(
          Json.obj("status" -> "conflict", "detail" -> "Sub-object conflict")
        )
      case _ =>
        logger.error(
          s"An uncaught database error occurred: ${err.getMessage}",
          err
        )
        InternalServerError(
          Json.obj("status" -> "error", "detail" -> "Database error, see logs")
        )
    }

  def createPackage = EditEditionsAuthAction(parse.json(32768L)) { req =>
    val result = for {
      packageInfo <- Try { req.body.as[CreatePackageRequest] }
      response <- Try { db.createPackage(packageInfo) }
    } yield response

    result match {
      case Success(_) => Created
      case Failure(JsResultException(errs)) =>
        logger.error(
          s"Could not create package due to JSON parsing errors: ${errs.mkString(", ")}"
        )
        BadRequest(
          Json.obj(
            "status" -> JsString("bad_request"),
            "detail" -> JsArray(errs.map(e => JsString(e.toString)))
          )
        )
      case Failure(err: PSQLException) =>
        psqlErrorHandler(err)
      case Failure(err) =>
        logger.error(s"Could not create package: ${err.getMessage}", err)
        InternalServerError(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString(
              err.getMessage
            ) // TODO - tighten this up when we are done testing
          )
        )
    }
  }

  def getPackage(id: java.util.UUID) = EditEditionsAuthAction { req =>
    try {
      val pkg =
        db.getPackages(Some(Seq(id)), None, strictTimestamp = false).headOption
      pkg match {
        case Some(p) =>
          val cards = db
            .getPackageCards(id)
            .map(model.packages.client.ClientPackageCard.fromPackageCard)
            .toList
          val clientPkg = ClientPackage.fromPackage(p, cards)
          Ok(ClientPackage.format.writes(clientPkg))
        case None =>
          NotFound(
            Json.obj(
              "status" -> JsString("error"),
              "detail" -> JsString(s"Package with id $id not found")
            )
          )
      }
    } catch {
      case err: Throwable =>
        logger.error(s"Could not get package: ${err.getMessage}", err)
        InternalServerError(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString(
              err.getMessage
            ) // TODO - tighten this up when we are done testing
          )
        )
    }
  }

  def putMetadata(id: UUID) =
    EditEditionsAuthAction(parse.json[PackageMetadata]) { req =>
      try {
        db.updatePackageMeta(id, req.body, req.user.username, req.user.email)
        NoContent
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          logger.error(
            s"Could not update package metadata: ${err.getMessage}",
            err
          )
          InternalServerError(
            Json.obj(
              "status" -> JsString("error"),
              "detail" -> JsString(
                err.getMessage
              ) // TODO - tighten this up when we are done testing
            )
          )
      }
    }

  def putPackageHiddenState(id: UUID, newState: Boolean) =
    EditEditionsAuthAction { req =>
      try {
        val count =
          db.updateHidden(id, newState, req.user.username, req.user.email)
        if (count == 0) {
          NotFound(
            Json.obj(
              "status" -> "not_found",
              "detail" -> "that package does not exist"
            )
          )
        } else {
          NoContent
        }
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          logger.error(
            s"Could not update package metadata: ${err.getMessage}",
            err
          )
          InternalServerError(
            Json.obj(
              "status" -> JsString("error"),
              "detail" -> JsString(
                err.getMessage
              ) // TODO - tighten this up when we are done testing
            )
          )
      }
    }

  def updateName(id: UUID) = EditEditionsAuthAction(parse.byteString) { req =>
    val decoder = StandardCharsets.UTF_8
      .newDecoder()
      .onMalformedInput(CodingErrorAction.REPORT)
      .onUnmappableCharacter(CodingErrorAction.REPORT)

    try {
      db.updatePackageName(
        id,
        decoder.decode(req.body.asByteBuffer).toString,
        req.user.username,
        req.user.email
      )
      NoContent
    } catch {
      case err: PSQLException =>
        psqlErrorHandler(err)
      case err: CharacterCodingException =>
        logger.error(s"CharacterCodingException: ${err.getMessage}", err)
        BadRequest(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString("Name was not valid utf-8")
          )
        )
      case err: MalformedInputException =>
        logger.error(s"MalformedInputException: ${err.getMessage}", err)
        BadRequest(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString("Name was not valid utf-8")
          )
        )
      case err: Throwable =>
        logger.error(
          s"Could not update package metadata: ${err.getMessage}",
          err
        )
        InternalServerError(
          Json.obj(
            "status" -> JsString("error"),
            "detail" -> JsString(
              err.getMessage
            ) // TODO - tighten this up when we are done testing
          )
        )
    }

  }

  def updateRegions(id: UUID) =
    EditEditionsAuthAction(parse.json[UpdateRegionsRequest]) { req =>
      val maybeUpdate = for {
        pkg <- db
          .getPackages(Some(Seq(id)), None, strictTimestamp = false)
          .headOption
        oldMeta <- pkg.feastMetadata
      } yield oldMeta.copy(
        excludedRegions = req.body.excludedRegions,
        targetedRegions = req.body.targetedRegions
      )

      try {
        val updatedRows = db.updatePackageMeta(
          id,
          newMeta = maybeUpdate.getOrElse(
            FeastPackageMetadata(
              excludedRegions = req.body.excludedRegions,
              targetedRegions = req.body.targetedRegions
            )
          ),
          userName = req.user.username,
          userEmail = req.user.email
        )
        if (updatedRows == 0) {
          NotFound(
            Json.obj(
              "status" -> "not found",
              "detail" -> "package id is not valid"
            )
          )
        } else {
          NoContent
        }
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          logger.error(
            s"Could not update package metadata: ${err.getMessage}",
            err
          )
          InternalServerError(
            Json.obj(
              "status" -> JsString("error"),
              "detail" -> JsString(
                err.getMessage
              ) // TODO - tighten this up when we are done testing
            )
          )
      }
    }

  def writePackage(id: UUID) =
    EditEditionsAuthAction(parse.json[ClientPackage]) { req =>
      val dataToWrite = req.body.copy(id = id.toString)
//      val cardRows = req.body.items.
//      db.updatePackage(
//        toPackage(dataToWrite)
//      )
      InternalServerError("not implemented")
    }
}
