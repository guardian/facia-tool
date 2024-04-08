package services.editions.publishing

import model.editions.PublishableIssue
import play.api.libs.json.Writes
import PublishedIssueFormatters._

trait PublicationTargetBase[T] {
  def putIssue(issue: PublishableIssue, key:String = "")(implicit evidence: Writes[T]): Unit = {
    putIssueJson(issue, "")
  }

  protected def putIssueJson[C: Writes](content: C, key:String): Unit

  def putEditionsList(rawJson: String): Unit
}

trait PublicationTarget extends PublicationTargetBase[PublishableIssue]

trait PublicationTargetWithTransform[T] extends PublicationTargetBase[T] {
  val transform:PublicationTransform[T]

  override def putIssue(issue: PublishableIssue, key:String = "")(implicit evidence: Writes[T]): Unit = {
    val jsonContent = transform.transformContent(issue)
    putIssueJson(jsonContent, key)
  }
}

