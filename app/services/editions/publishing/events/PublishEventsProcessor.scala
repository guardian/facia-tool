package services.editions.publishing.events

import logging.Logging

private[events] object PublishEventsProcessor {
  def apply(sqsFacade: PublishEventsQueueFacade): PublishEventsProcessor =
    new PublishEventsProcessor(sqsFacade)
}

private[events] class PublishEventsProcessor(
    sqsFacade: PublishEventsQueueFacade
) extends Logging {

  def processPublishEvent(updateEventInDB: PublishEvent => Boolean): Unit = {
    sqsFacade.getPublishEventFromQueue.foreach { sqsEvent =>
      {
        val publishEvent = sqsEvent.event
        logger.info(s"received publish event from SQS")(
          publishEvent.toLogMarker
        )
        if (updateEventInDB(publishEvent)) {
          sqsFacade.delete(sqsEvent.receiptHandle)
        }
      }
    }
  }
}
