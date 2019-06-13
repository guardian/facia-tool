package model.forms

import java.time.LocalDate

import play.api.libs.json.Json

case class CreateIssue(issueDate: LocalDate)

object CreateIssue {
  implicit val format = Json.format[CreateIssue]
}

