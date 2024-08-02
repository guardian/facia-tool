package services.editions.publishing.events

import logging.Logging

import scala.util.{Failure, Success, Try}

private[events] object PublishEventsProcessor {
  def apply(sqsFacade: PublishEventsQueueFacade): PublishEventsProcessor =
    new PublishEventsProcessor(sqsFacade)
}

private[events] class PublishEventsProcessor(sqsFacade: PublishEventsQueueFacade) extends Logging {

  def processPublishEvent(updateEventInDB: PublishEvent => Try[Unit]): Unit = {
    sqsFacade.getPublishEventFromQueue.foreach { sqsEvent =>
      val publishEvent = sqsEvent.event
      logger.info(s"Received publish event from SQS: $publishEvent")(publishEvent.toLogMarker)
      updateEventInDB(publishEvent) match {
        case Success(_) => sqsFacade.delete(sqsEvent.receiptHandle)
        case Failure(exception) => logger.error("Could not write publish event", exception)
      }
    }
  }
}
