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

  def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }
}
