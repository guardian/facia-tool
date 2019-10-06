package services.editions.publishing.events

import java.time.{LocalDate, LocalDateTime}

import model.editions.{Edition, IssueVersionStatus}
import org.scalatest.{FunSuite, Matchers}

class PublishEventsProcessorTest extends FunSuite with Matchers {

  private val initialMessagesInQueue = List(
    PublishEventMessage(receiptHandle = "123", event = PublishEvent(
      edition = Edition.DailyEdition,
      version = "2019-01-01T13:05:01.000Z",
      issueDate = LocalDate.of(2019, 1, 1),
      status = IssueVersionStatus.Published,
      message = "Publication processing complete",
      timestamp = LocalDateTime.of(2019, 1, 1, 13, 5, 1, 0)
    )),
    PublishEventMessage(receiptHandle = "456", event = PublishEvent(
      edition = Edition.DailyEdition,
      version = "2019-01-01T13:05:01.000Z",
      issueDate = LocalDate.of(2019, 1, 1),
      status = IssueVersionStatus.Published,
      message = "Publication processing complete",
      timestamp = LocalDateTime.of(2019, 1, 1, 13, 5, 1, 0)
    ))
  )

  test("queue messages were deleted after updating events in DB was successful") {
    val queueFacade = new InMemoQueue(initialMessagesInQueue)
    val processor = new PublishEventsProcessor(queueFacade)

    def stubDBUpdateAlwaysSuccess(events: List[PublishEvent]): Boolean = true

    processor.processPublishEvents(stubDBUpdateAlwaysSuccess)

    queueFacade.getPublishEventsFromQueue shouldEqual Nil
  }

  test("queue messages were NOT deleted after updating events in DB was NOT successful") {
    val queueFacade = new InMemoQueue(initialMessagesInQueue)
    val processor = new PublishEventsProcessor(queueFacade)

    def stubDBUpdateAlwaysFailure(events: List[PublishEvent]): Boolean = false

    processor.processPublishEvents(stubDBUpdateAlwaysFailure)

    queueFacade.getPublishEventsFromQueue shouldEqual initialMessagesInQueue
  }

}

class InMemoQueue(initialMessages: List[PublishEventMessage]) extends PublishEventsQueueFacade {
  private var queue = initialMessages

  override def getPublishEventsFromQueue: List[PublishEventMessage] = queue

  override def delete(receiptHandle: String): Unit = {
    queue = queue.filter(e => e.receiptHandle == receiptHandle)
  }
}
