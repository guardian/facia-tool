package services.editions.publishing

import logging.Logging

private[publishing] object IssuePublishEventsProcessor {
  def apply(sqsFacade: IssuePublishEventsQueueFacade): IssuePublishEventsProcessor =
    new IssuePublishEventsProcessor(sqsFacade)
}

private[publishing] class IssuePublishEventsProcessor(sqsFacade: IssuePublishEventsQueueFacade) extends Logging {

  def processPublishEvents(updateEventInDB: List[PublishedEvent] => Boolean) = {
    val sqsEvents = sqsFacade.getPublishEventsFromQueue
    val issuePublishEvents = sqsEvents.map(_.event)
    logger.info(s"received publish events from SQS: $issuePublishEvents")

    if (updateEventInDB(issuePublishEvents)) {
      sqsEvents.foreach(e => sqsFacade.delete(e.receiptHandle))
    }

  }

}
