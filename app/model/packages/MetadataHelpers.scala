package model.packages

import logging.Logging
import org.postgresql.util.PGobject
import play.api.libs.json.{JsResult, JsValue, Json}

import scala.util.Try

trait MetadataHelpers extends Logging {

  /** Helper method to turn a JsResult into Either[String, Result]
    * @param data
    *   the incoming JsResult
    * @tparam T
    *   the data type returned on success
    * @return
    *   either the successful result, or a formatted error string
    */
  private def formatJsResult[T](data: JsResult[T]): Either[String, T] = {
    data.asEither.left.map(errorList => {
      val errors = errorList.map({ case (path, errors) =>
        s"$path has ${errors.length} errors: ${errors.map(_.toString).mkString(",")}"
      })
      errors.mkString("\n")
    })
  }

  protected def getPackageMetadata(
      jsContent: String
  ): Option[PackageMetadata] = {
    val maybeObject = for {
      js <- Try { Json.parse(jsContent) }.toEither.left.map(_.toString)
      meta <- formatJsResult(PackageMetadata.format.reads(js))
    } yield meta
    maybeObject match {
      case Left(err) =>
        logger.error(s"Invalid Feast collection metadata: $err")
        None
      case Right(meta) => Some(meta)
    }
  }

  def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }
}
