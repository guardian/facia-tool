package services.editions.publishing

import model.editions.PublishableIssue

trait PublicationTarget {
  def putIssue(issue: PublishableIssue): Unit
  def putEditionsList(rawJson: String): Unit
}
