package model.packages

import logging.Logging
import model.packages.Package.PackageType
import org.postgresql.util.PGobject
import play.api.libs.json.{
  JsDefined,
  JsError,
  JsLookupResult,
  JsResult,
  JsString,
  JsValue,
  Json
}

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

  def selectByPackageType[T](
      selector: JsLookupResult
  )(f: Package.PackageType => JsResult[T]): JsResult[T] = selector match {
    case JsDefined(JsString(PackageType.Feast.value)) =>
      f(PackageType.Feast)
    case JsDefined(JsString(PackageType.Story.value)) =>
      f(PackageType.Story)
    case _ => JsError("package type must be Feast or Story")
  }

  def toPGobject(value: JsValue): PGobject = {
    val pgObject = new PGobject()
    pgObject.setType("jsonb")
    pgObject.setValue(Json.stringify(value))
    pgObject
  }
}
