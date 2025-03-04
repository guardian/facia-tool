package util

import play.api.libs.json.{Json, Reads}
import play.api.mvc.AnyContent

object Requests {
  implicit class RichAnyContent(content: AnyContent) {

    /** Attempts to de-serialize a B from the JSON request body */
    def read[B: Reads]: Option[B] = for {
      json <- content.asJson
      b <- Json.fromJson[B](json).asOpt
    } yield b
  }
}
