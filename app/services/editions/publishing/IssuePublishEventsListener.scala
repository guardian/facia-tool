package services.editions.publishing

import akka.actor.Scheduler
import logging.Logging
import services.editions.QueueConnector

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.util.{Failure, Success}

object IssuePublishEventsListener {
  def apply(queueConnector: QueueConnector, scheduler: Scheduler, intervalInSec: Int = 60): IssuePublishEventsListener =
    new IssuePublishEventsListener(queueConnector, scheduler, intervalInSec)
}

private[publishing] class IssuePublishEventsListener(val queueConnector: QueueConnector, val scheduler: Scheduler, intervalInSec: Int) extends Logging {

  private val sqsReader = IssuePublishEventsReader(queueConnector)

  logger.info("Starting to listen issue publish events")
  scheduler.schedule(0.seconds, intervalInSec.seconds) {
    processPublishEvents
  }

  def processPublishEvents: Unit = {
    logger.info("process new publish events")

    val event = getPublishEventsFromSQS

    event.foreach(println(_))

  }

  private def getPublishEventsFromSQS: List[IssuePublishedEvent] = {
    sqsReader.readPublishEvents match {
      case Success(messages) =>
        logger.info("publish events read from SQS successfully")
        messages.map(_.event)
      case Failure(e) =>
        logger.error(s"There was an exception while reading events: ${e.getMessage} from SQS")
        e.printStackTrace()
        Nil
    }
  }
}

