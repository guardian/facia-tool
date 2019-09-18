package services.editions.publishing.events

import logging.Logging

private[events] object PublishEventsProcessor {
  def apply(sqsFacade: PublishEventsQueueFacade): PublishEventsProcessor =
    new PublishEventsProcessor(sqsFacade)
}

private[events] class PublishEventsProcessor(sqsFacade: PublishEventsQueueFacade) extends Logging {

  def processPublishEvents(updateEventInDB: List[PublishedEvent] => Boolean): Unit = {
    val sqsEvents = sqsFacade.getPublishEventsFromQueue
    val issuePublishEvents = sqsEvents.map(_.event)
    logger.info(s"received publish events from SQS: $issuePublishEvents")

    if (updateEventInDB(issuePublishEvents)) {
      sqsEvents.foreach(e => sqsFacade.delete(e.receiptHandle))
    }

  }

}
