package services.editions.publishing.events

import java.util.concurrent.Executors

import conf.ApplicationConfiguration
import logging.Logging
import services.editions.db.EditionsDB

import scala.concurrent._
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

object PublishEventsListener {
  def apply(
      config: ApplicationConfiguration,
      db: EditionsDB
  ): PublishEventsListener =
    new PublishEventsListener(config, db: EditionsDB)
}

private[events] class PublishEventsListener(
    val config: ApplicationConfiguration,
    db: EditionsDB
) extends Logging {

  private val sqsFacade = PublishEventsSQSFacade(config)

  private val issuePublishEventsProcessor =
    PublishEventsProcessor.apply(sqsFacade)

  private implicit val context: ExecutionContextExecutor =
    ExecutionContext.fromExecutor(Executors.newSingleThreadExecutor())

  def start: Unit = {
    val delayStart = 5.seconds.fromNow
    val results = Future {
      val tName = Thread.currentThread().getName
      delay(delayStart)
      logger.info(s"Starting to listen publish events on SQS in thread: $tName")
      processPublishEventsInLongPooling(db.insertIssueVersionEvent)
    }
    results.onComplete {
      case Success(x) => {
        logger.info("Stopping to listen publish events on SQS")
      }
      case Failure(e) => {
        logger.error(
          s"Failure while listening to publish events on SQS: ${e.getMessage}",
          e
        )
      }
    }
  }

  /** while(true) here is for SQS long pooling the wait time between requests
    * when queue gets empty will be set in
    * \@PublishEventsSQSFacade.sqsClientLongPoolingWaitTimeSec constant
    */
  private def processPublishEventsInLongPooling(
      updateEventInDB: PublishEvent => Boolean
  ): Unit = {
    while (true) {
      issuePublishEventsProcessor.processPublishEvent(updateEventInDB)
    }
  }

  private def delay(dur: Deadline) = Try(
    Await.ready(Promise().future, dur.timeLeft)
  )

}
