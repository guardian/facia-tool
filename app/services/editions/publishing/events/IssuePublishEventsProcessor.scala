package services.editions.publishing.events

import logging.Logging

private[events] object IssuePublishEventsProcessor {
  def apply(sqsFacade: IssuePublishEventsQueueFacade): IssuePublishEventsProcessor =
    new IssuePublishEventsProcessor(sqsFacade)
}

private[events] class IssuePublishEventsProcessor(sqsFacade: IssuePublishEventsQueueFacade) extends Logging {

  def processPublishEvents(updateEventInDB: List[PublishedEvent] => Boolean): Unit = {
    val sqsEvents = sqsFacade.getPublishEventsFromQueue
    val issuePublishEvents = sqsEvents.map(_.event)
    logger.info(s"received publish events from SQS: $issuePublishEvents")

    if (updateEventInDB(issuePublishEvents)) {
      sqsEvents.foreach(e => sqsFacade.delete(e.receiptHandle))
    }

  }

}
