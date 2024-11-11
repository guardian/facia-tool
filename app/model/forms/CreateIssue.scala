package model.forms

import java.time.LocalDate
import play.api.libs.json.{Json, OFormat}

case class CreateIssue(issueDate: LocalDate)

object CreateIssue {
  implicit val format: OFormat[CreateIssue] = Json.format[CreateIssue]
}
