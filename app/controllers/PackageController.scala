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
  ClientPackageCard,
  ClientPackageHeader,
  CreatePackageRequest,
  ErrorResponse,
  UpdateRegionsRequest
}
import org.postgresql.util.{PSQLException, PSQLState}
import services.Capi
import services.editions.db.{FaciaDB, PackageQueries}
import services.editions.publishing.Publishing
import play.api.libs.json._

import java.nio.charset.{
  CharacterCodingException,
  CodingErrorAction,
  MalformedInputException,
  StandardCharsets
}
import java.time.{OffsetDateTime, ZoneId, ZoneOffset}
import java.time.format.DateTimeFormatter
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}
import model.packages.client.ErrorResponse._

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

  def listPackages(
      id: Option[String],
      full: Option[Boolean],
      date: Option[String],
      strict: Option[Boolean],
      title: Option[String],
      limit: Option[Int],
      order: Option[String]
  ) = EditPackagesAuthAction { req =>
    import cats.syntax.traverse._ // Provides the .sequence extension method
    import cats.instances.try_._ // Provides Applicative[Try]
    import cats.instances.option._ // Provides Traverse[Option]

    val idList = id
      .map(_.split(",").toSeq)
      .map(_.map(toUuid).collect({ case Some(uuid) => uuid }))

    val maybeDate =
      req
        .getQueryString("date")
        .map(date =>
          Try {
            java.time.LocalDate
              .parse(date, dateFormatter)
              .atStartOfDay(ZoneOffset.UTC)
              .toOffsetDateTime
          }
        )
        .sequence // 'sequence' is a piece of magic from `cats`, which here converts Option[Try[T]] into Try[Option[T]]
    val strictDate = strict.getOrElse(false)
    val queryLimit = limit.getOrElse(200)
    val orderBy = order
      .flatMap(PackageQueries.OrderingField.fromString)
      .getOrElse(PackageQueries.CreatedOn)

    maybeDate match {
      case Failure(err) =>
        logger.error(
          s"invalid date format in ${req.getQueryString("date")}: ${err.getMessage}"
          // deliberately don't bother with the whole stack trace as we don't need it for debugging this particular error
        )
        BadRequest(
          ErrorResponse.badRequest("invalid date format")
        )
      case Success(dateValue) =>
        if (queryLimit > 500) {
          BadRequest(
            ErrorResponse.badRequest("limit is too large")
          )
        } else if (queryLimit < 1) {
          BadRequest(
            ErrorResponse.badRequest("limit must be a positive integer")
          )
        } else if (idList.isEmpty && req.getQueryString("id").isDefined) {
          BadRequest(
            ErrorResponse.badRequest("no valid ids were supplied")
          )
        } else {
          try {
            val pkgs = db.getPackages(
              idList,
              dateValue,
              strictDate,
              title,
              orderBy,
              queryLimit
            )
            if (full.getOrElse(false)) {
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
                  "packages" -> JsArray(
                    clientPkgs.map(ClientPackage.format.writes)
                  )
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
                ErrorResponse(err.getMessage)
              )
          }
        }
    }
  }

  private def genericErrorHandler(err: Throwable) = {
    logger.error(
      s"Could not update package metadata: ${err.getMessage}",
      err
    )
    InternalServerError(
      ErrorResponse(err.getMessage)
    )
  }

  private def psqlErrorHandler(err: PSQLException) =
    err.getSQLState match {
      // See https://www.postgresql.org/docs/current/errcodes-appendix.html for a list of codes
      case s
          if s == PSQLState.UNIQUE_VIOLATION.getState => // unique constraint violation
        Conflict(
          ErrorResponse.conflict("Cannot overwrite existing object")
        )
      case s
          if s == PSQLState.FOREIGN_KEY_VIOLATION.getState => // foreign key violation
        Conflict(
          ErrorResponse.conflict("Sub-object conflict")
        )
      case _ =>
        logger.error(
          s"An uncaught database error occurred: ${err.getMessage}",
          err
        )
        InternalServerError(
          ErrorResponse("Database error, see logs")
        )
    }

  def createPackage = EditPackagesAuthAction(parse.json(32768L)) { req =>
    val result = for {
      packageInfo <- Try { req.body.as[CreatePackageRequest] }
      _ <- Try {
        UUID.fromString(packageInfo.id)
      } // validate that the ID is a real UUID
      response <- Try { db.createPackage(packageInfo) }
    } yield response

    result match {
      case Success(_) => Created
      case Failure(JsResultException(errs)) =>
        logger.error(
          s"Could not create package due to JSON parsing errors: ${errs.mkString(", ")}"
        )
        BadRequest(
          ErrorResponse.badRequest(errs.mkString(";"))
        )
      case Failure(err: PSQLException) =>
        psqlErrorHandler(err)
      case Failure(err: IllegalArgumentException) =>
        logger.error(s"Invalid UUID when creating package: ${err.getMessage}")
        BadRequest(
          ErrorResponse.badRequest("Invalid package ID")
        )
      case Failure(err) =>
        logger.error(s"Could not create package: ${err.getMessage}", err)
        InternalServerError(
          ErrorResponse.apply(err.getMessage)
        )
    }
  }

  def getPackage(id: java.util.UUID) = EditPackagesAuthAction { req =>
    try {
      val pkg = db.getPackageById(id)
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
            ErrorResponse.notFound(s"Package with id $id not found")
          )
      }
    } catch {
      case err: Throwable =>
        genericErrorHandler(err)
    }
  }

  def putMetadata(id: UUID) =
    EditPackagesAuthAction(parse.json[PackageMetadata]) { req =>
      try {
        db.updatePackageMeta(id, req.body, req.user.username, req.user.email)
        NoContent
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          genericErrorHandler(err)
      }
    }

  def putPackageHiddenState(id: UUID, newState: Boolean) =
    EditPackagesAuthAction { req =>
      try {
        val count =
          db.updateHidden(id, newState, req.user.username, req.user.email)
        if (count == 0) {
          NotFound(
            ErrorResponse.notFound("that package does not exist")
          )
        } else {
          NoContent
        }
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          genericErrorHandler(err)
      }
    }

  def updateName(id: UUID) = EditPackagesAuthAction(parse.byteString) { req =>
    val decoder = StandardCharsets.UTF_8
      .newDecoder()
      .onMalformedInput(CodingErrorAction.REPORT)
      .onUnmappableCharacter(CodingErrorAction.REPORT)

    try {
      val count = db.updatePackageName(
        id,
        decoder.decode(req.body.asByteBuffer).toString,
        req.user.username,
        req.user.email
      )
      if (count == 0) {
        NotFound(
          ErrorResponse.notFound("that package does not exist")
        )
      } else {
        NoContent
      }
    } catch {
      case err: PSQLException =>
        psqlErrorHandler(err)
      case err: MalformedInputException =>
        logger.error(s"MalformedInputException: ${err.getMessage}", err)
        BadRequest(
          ErrorResponse.badRequest("Name was not valid utf-8")
        )
      case err: CharacterCodingException =>
        logger.error(s"CharacterCodingException: ${err.getMessage}", err)
        BadRequest(
          ErrorResponse.badRequest("Name was not valid utf-8")
        )
      case err: Throwable =>
        genericErrorHandler(err)
    }
  }

  def updateRegions(id: UUID) =
    EditPackagesAuthAction(parse.json[UpdateRegionsRequest]) { req =>
      val updateOrErr = for {
        pkg <- db
          .getPackages(Some(Seq(id)), None, strictTimestamp = false)
          .headOption
        oldMeta <- pkg.metadata
      } yield oldMeta match {
        case f: FeastPackageMetadata =>
          Right(
            f.copy(
              excludedRegions = req.body.excludedRegions,
              targetedRegions = req.body.targetedRegions
            )
          )
        case _: WebPackageMetadata =>
          Left("Regions only apply to Feast collections")
      }

      updateOrErr match {
        case Some(Left(err)) =>
          BadRequest(ErrorResponse.badRequest(err))
        case _ =>
          val maybeUpdate = updateOrErr.flatMap(_.toOption)
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
                ErrorResponse.notFound("package id is not valid")
              )
            } else {
              NoContent
            }
          } catch {
            case err: PSQLException =>
              psqlErrorHandler(err)
            case err: Throwable =>
              genericErrorHandler(err)
          }
      }
    }

  def writePackage(id: UUID) =
    EditPackagesAuthAction(parse.json[ClientPackage]) { req =>
      val newMeta = toPackage(req.body.copy(id = id.toString))
      val cards = req.body.items.zipWithIndex.map({ case (clientCard, idx) =>
        ClientPackageCard.toPackageCard(
          clientCard,
          id,
          idx,
          req.user.username,
          req.user.email,
          zoneId = Some(ZoneOffset.UTC)
        )
      })
      try {
        val updated = db.updatePackage(newMeta, cards)
        if (updated == 0) {
          logger.info(s"Request to update non-existent package $id")
          NotFound(
            ErrorResponse.notFound("package ID is not valid")
          )
        } else {
          db.getPackageById(id) match {
            case Some(updatedPkg) =>
              val updatedCards = db.getPackageCards(id)
              val clientPackage = ClientPackage.fromPackage(
                updatedPkg,
                updatedCards.map(ClientPackageCard.fromPackageCard).toList
              )
              Ok(ClientPackage.format.writes(clientPackage))
            case None =>
              logger.error(
                s"Package $id was deleted immediately after update, this should not happen"
              )
              NotFound(
                ErrorResponse.notFound("package ID is not valid")
              )
          }
        }
      } catch {
        case err: PSQLException =>
          psqlErrorHandler(err)
        case err: Throwable =>
          genericErrorHandler(err)
      }
    }
}
