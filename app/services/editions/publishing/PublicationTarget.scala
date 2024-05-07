package services.editions.publishing

import model.editions.PublishableIssue
import play.api.libs.json.Writes
import PublishedIssueFormatters._

trait PublicationTarget {
  def putIssue(issue: PublishableIssue, key:Option[String] = None): Unit

  protected def putIssueJson[C: Writes](content: C, key:String): Unit

  //FIXME: It seems strange and awkward to have one method which puts structured data and another that does the same
  //but with an arbitrary string, making it unchecked.  This can probably be pulled into `putIssueJson` but I think that
  // is out of scope for this PR
  def putEditionsList(rawJson: String): Unit
}

