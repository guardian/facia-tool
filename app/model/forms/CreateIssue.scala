package model.forms

import java.time.ZonedDateTime

import play.api.libs.json.Json

case class CreateIssue(name: String, publishDate: ZonedDateTime)

object CreateIssue {
  implicit val format = Json.format[CreateIssue]
}

