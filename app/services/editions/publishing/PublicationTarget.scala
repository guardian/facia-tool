package services.editions.publishing

import model.editions.EditionsIssue
import model.editions.PublishAction.PublishAction
import play.api.libs.json.Writes

trait PublicationTarget extends PublicationTargetHelpers {
  def putIssue(
      issue: EditionsIssue,
      version: String,
      action: PublishAction
  ): Either[String, Unit]

  protected def putIssueJson[C: Writes](content: C, key: String): Unit

  // FIXME: It seems strange and awkward to have one method which puts structured data and another that does the same
  // but with an arbitrary string, making it unchecked.  This can probably be pulled into `putIssueJson` but I think that
  // is out of scope for this PR
  def putEditionsList(rawJson: String): Unit
}

object PublicationTarget extends PublicationTargetHelpers

trait PublicationTargetHelpers {
  private def createIssuePrefix(issue: EditionsIssue): String =
    s"${issue.edition.entryName}/${issue.issueDate.toString}"

  private def createIssueFilename(version: String): String = s"$version.json"

  def createKey(issue: EditionsIssue, version: String): String =
    s"${createIssuePrefix(issue)}/${createIssueFilename(version)}"
}
