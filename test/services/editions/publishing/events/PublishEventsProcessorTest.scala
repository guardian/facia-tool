package services.editions.publishing.events

import org.scalatest.{FunSuite, Matchers}

class PublishEventsProcessorTest extends FunSuite with Matchers {

  private val initialMessagesInQueue = List(
    PublishEventMessage(receiptHandle = "123", event = PublishedEvent("Published", "issue 123")),
    PublishEventMessage(receiptHandle = "456", event = PublishedEvent("Published", "issue 456"))
  )

  test("queue messages were deleted after updating events in DB was successful") {
    val queueFacade = new InMemoQueue(initialMessagesInQueue)
    val processor = new PublishEventsProcessor(queueFacade)

    def stubDBUpdateAlwaysSuccess(events: List[PublishedEvent]): Boolean = true

    processor.processPublishEvents(stubDBUpdateAlwaysSuccess)

    queueFacade.getPublishEventsFromQueue shouldEqual Nil
  }

  test("queue messages were NOT deleted after updating events in DB was NOT successful") {
    val queueFacade = new InMemoQueue(initialMessagesInQueue)
    val processor = new PublishEventsProcessor(queueFacade)

    def stubDBUpdateAlwaysFailure(events: List[PublishedEvent]): Boolean = false

    processor.processPublishEvents(stubDBUpdateAlwaysFailure)

    queueFacade.getPublishEventsFromQueue shouldEqual initialMessagesInQueue
  }

}

class InMemoQueue(initialMessages: List[PublishEventMessage]) extends IssuePublishEventsQueueFacade {
  private var queue = initialMessages

  override def getPublishEventsFromQueue: List[PublishEventMessage] = queue

  override def delete(receiptHandle: String): Unit = {
    queue = queue.filter(e => e.receiptHandle == receiptHandle)
  }
}
