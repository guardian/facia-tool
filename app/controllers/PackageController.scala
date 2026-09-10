package controllers

import logging.Logging
import model.forms.GetPackagesFilter
import model.packages.client.{ClientPackage, CreatePackageRequest}
import services.Capi
import services.editions.db.FaciaDB
import services.editions.publishing.Publishing
import play.api.libs.json._

import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.util.{Try, Success, Failure}

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
    val maybeDate =
      req.getQueryString("date").map(OffsetDateTime.parse(_, dateFormatter))
    val strictDate = req.getQueryString("strict").isDefined

    try {
      val pkgs = db.getPackages(idList, maybeDate, strictDate)
      val clientPkgs = pkgs.map { pkg =>
        val cards = db.getPackageCards(java.util.UUID.fromString(pkg.id))
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
    } catch {
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
          val cards = db.getPackageCards(id)
            .map(model.packages.client.ClientPackageCard.fromPackageCard)
            .toList
          val clientPkg = ClientPackage.fromPackage(p, cards)
          Ok(
            Json.obj(
              "status" -> JsString("ok"),
              "metadata" -> ClientPackage.format.writes(clientPkg)
            )
          )
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
}
