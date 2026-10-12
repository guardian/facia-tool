package controllers

import logging.Logging
import model.packages.Package.PackageType
import model.packages.{PackageCard, PackageMetadata, Package => DomainPackage}
import model.packages.client.{
  ClientPackage,
  ClientPackageCard,
  CreatePackageRequest,
  ErrorResponse,
  UpdateNameRequest,
  WritePackageRequest
}
import org.postgresql.util.{PSQLException, PSQLState}
import services.editions.db.{FaciaDB, PackageQueries}
import services.editions.publishing.Publishing
import play.api.libs.json._

import java.nio.charset.{
  CharacterCodingException,
  CodingErrorAction,
  MalformedInputException,
  StandardCharsets
}
import java.time.{OffsetDateTime, ZoneOffset}
import java.time.format.DateTimeFormatter
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}
import model.packages.client.ErrorResponse._
import play.api.mvc.Result

class PackageController(
    db: FaciaDB,
    publishing: Publishing,
    val deps: BaseFaciaControllerComponents
)(implicit ec: ExecutionContext)
    extends BaseFaciaController(deps)
    with Logging {

  private def toUuid(str: String): Option[UUID] = Try {
    UUID.fromString(str)
  }.toOption

  private def updateFailureExceptionHandler(err: Throwable) = {
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

  private def dateFormatter = DateTimeFormatter.BASIC_ISO_DATE

  private def withErrorHandling(blk: => Result) = {
    try {
      blk
    } catch {
      case err: PSQLException =>
        psqlErrorHandler(err)
      case err: Throwable =>
        updateFailureExceptionHandler(err)
    }
  }

  def listPackages(
      id: Option[String],
      full: Option[Boolean],
      `type`: Option[String],
      date: Option[String],
      strict: Option[Boolean],
      title: Option[String],
      limit: Option[Int],
      order: Option[String]
  ) = EditPackagesAuthAction { req =>
    import cats.syntax.traverse._ // Provides the .sequence extension method for date handling
    import cats.instances.try_._ // Provides Applicative[Try] for date handling
    import cats.instances.option._ // Provides Traverse[Option] for date handling

    val idList = id
      .map(_.split(",").toSeq)
      .map(_.map(toUuid).collect({ case Some(uuid) => uuid }))

    val maybeDate = date
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

    val typefilter = `type`.flatMap(PackageType.withName)

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
              typefilter,
              orderBy,
              queryLimit
            )
            if (full.contains(true)) {
              val clientPkgs = pkgs.map { pkg =>
                val cards = db
                  .getPackageCards(pkg.id)
                  .map(ClientPackageCard.fromPackageCard)
                  .toList
                ClientPackage.fromPackage(pkg, cards)
              }

              Ok(
                Json.obj(
                  "packages" -> JsArray(
                    clientPkgs.map(ClientPackage.writes.writes)
                  )
                )
              )
            } else {
              Ok(
                Json.obj(
                  "packages" -> JsArray(
                    pkgs.map(DomainPackage.format.writes)
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

  def createPackage = EditPackagesAuthAction(parse.json[CreatePackageRequest]) {
    req =>
      withErrorHandling {
        db.createPackage(
          req.body,
          OffsetDateTime.now(),
          s"${req.user.firstName} ${req.user.lastName}",
          req.user.email
        )
        Created
      }
  }

  def getPackage(id: java.util.UUID) = EditPackagesAuthAction { req =>
    withErrorHandling {
      db.getPackageById(id) match {
        case Some(pkg) =>
          val cards = db
            .getPackageCards(id)
            .map(model.packages.client.ClientPackageCard.fromPackageCard)
            .toList
          val clientPkg = ClientPackage.fromPackage(pkg, cards)
          Ok(Json.toJson(clientPkg))
        case None =>
          NotFound(
            ErrorResponse.notFound(s"Package with id $id not found")
          )
      }
    }
  }

  def putMetadata(id: UUID) =
    EditPackagesAuthAction(parse.json[PackageMetadata]) { req =>
      withErrorHandling {
        db.updatePackageMeta(
          id,
          req.body,
          req.user.username,
          req.user.email
        ) match {
          case Right(n) if n > 0 =>
            NoContent
          case Right(_) =>
            NotFound(
              ErrorResponse.notFound("that package does not exist")
            )
          case Left(err) =>
            BadRequest(ErrorResponse.badRequest(err))
        }
      }
    }

  def putPackageHiddenState(id: UUID, newState: Boolean) =
    EditPackagesAuthAction { req =>
      withErrorHandling {
        val count =
          db.updateHidden(id, newState, req.user.username, req.user.email)
        if (count == 0) {
          NotFound(
            ErrorResponse.notFound("that package does not exist")
          )
        } else {
          NoContent
        }
      }
    }

  def updateName(id: UUID) =
    EditPackagesAuthAction(parse.json[UpdateNameRequest]) { req =>
      withErrorHandling {
        val count = db.updatePackageName(
          id,
          req.body.name,
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
      }
    }

  def writePackage(id: UUID) =
    EditPackagesAuthAction(parse.json[WritePackageRequest]) { req =>
      val newMeta = req.body.toPackage(
        id,
        OffsetDateTime.now(),
        updatedBy = req.user.username,
        updatedEmail = req.user.email
      )
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
      withErrorHandling {
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
              Ok(Json.toJson(clientPackage))
            case None =>
              logger.error(
                s"Package $id was deleted immediately after update, this should not happen"
              )
              NotFound(
                ErrorResponse.notFound("package ID is not valid")
              )
          }
        }
      }
    }

  def publish(id: UUID) = EditPackagesAuthAction { req =>
    try {
      db.getPackageById(id) match {
        case Some(pkg) =>
          val cards =
            db.getPackageCards(id)
              .map(_.toPackageCard)
              .collect({ case Some(card) => card })
          publishing.publishPackage(pkg, cards, req.user) match {
            case Left(err) =>
              logger.error(s"Unable to publish package with ID $id: $err")
              InternalServerError(
                ErrorResponse(
                  "Unable to publish this package, see the server logs for details"
                )
              )
            case Right(_) =>
              logger.info(s"Successfully published package with ID $id")
              NoContent
          }
        case None =>
          NotFound(ErrorResponse.notFound("package ID is not valid"))
      }
    } catch {
      case err: PSQLException =>
        psqlErrorHandler(err)
      case err: Throwable =>
        logger.error(
          s"Unexpected error when publishing package with id $id: ${err.getMessage}",
          err
        )
        InternalServerError(
          ErrorResponse(
            "Unexpected error, please see the server logs for more details"
          )
        )
    }
  }
}
