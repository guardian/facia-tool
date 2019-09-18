package services.editions.publishing.events

import java.util.concurrent.Executors

import conf.ApplicationConfiguration
import logging.Logging

import scala.concurrent._
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

object PublishEventsListener {
  def apply(config: ApplicationConfiguration): PublishEventsListener =
    new PublishEventsListener(config)
}

private[events] class PublishEventsListener(val config: ApplicationConfiguration) extends Logging {

  private val sqsFacade = IssuePublishEventsSQSFacade(config)

  private val issuePublishEventsProcessor = PublishEventsProcessor.apply(sqsFacade)

  private implicit val context: ExecutionContextExecutor = ExecutionContext.fromExecutor(Executors.newSingleThreadExecutor())

  // will be implemented in next PR
  def stub(events: List[PublishedEvent]): Boolean = {
    logger.info("update events in DB")
    false
  }

  def start: Unit = {
    val delayStart = 5.seconds.fromNow
    val results = Future {
      val tName = Thread.currentThread().getName
      delay(delayStart)
      logger.info(s"Starting to listen publish events on SQS in thread: $tName")
      processPublishEventsInLongPooling(stub)
    }
    results.onComplete {
      case Success(x) => {
        logger.info("Stopping to listen publish events on SQS")
      }
      case Failure(e) => {
        logger.error(s"Failure while listening to publish events on SQS: ${e.getMessage}", e)
      }
    }
  }

  /**
   * while(true) here is for SQS long pooling
   * the wait time between requests when queue gets empty will be set in @IssuePublishEventsSQSFacade.sqsClientLongPoolingWaitTimeSec constant
   */
  private def processPublishEventsInLongPooling(updateEventInDB: List[PublishedEvent] => Boolean): Unit = {
    while (true) {
      issuePublishEventsProcessor.processPublishEvents(updateEventInDB)
    }
  }

  private def delay(dur: Deadline) = Try(Await.ready(Promise().future, dur.timeLeft))

}

