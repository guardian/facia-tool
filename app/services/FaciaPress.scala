package services

import com.amazonaws.regions.Regions
import com.amazonaws.services.sns.AmazonSNSAsyncClientBuilder
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.SendMessageResult
import com.gu.facia.api.models.faciapress.{Draft, FrontPath, Live, PressJob}
import conf.ApplicationConfiguration
import metrics.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}
import logging.Logging

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}
import com.google.api.client.json.Json
import com.amazonaws.services.sns.AmazonSNSClientBuilder
import com.amazonaws.services.sns.model.PublishResult

case class PressCommand(
  collectionIds: Set[String],
  live: Boolean = false,
  draft: Boolean = false,
  forceConfigUpdate: Option[Boolean] = Option(false))
{
  def withPressLive(b: Boolean = true): PressCommand = this.copy(live = b)
  def withPressDraft(b: Boolean = true): PressCommand = this.copy(draft = b)
  def withForceConfigUpdate(b: Boolean = true): PressCommand = this.copy(forceConfigUpdate = Option(b))
}

object PressCommand {
  def forOneId(id: String): PressCommand = PressCommand(Set(id))
}

class FaciaPressQueue(val config: ApplicationConfiguration) {
  val maybeQueue = config.faciatool.frontPressToolQueue map { queueUrl =>
    val credentials = config.aws.frontendAccountCredentials
    JsonMessageQueue[PressJob](
      AmazonSQSAsyncClientBuilder.standard()
        .withCredentials(credentials)
        .withRegion(Regions.EU_WEST_1).build(),
      queueUrl
    )
  }

  def enqueue(job: PressJob): Future[SendMessageResult] = {
    maybeQueue match {
      case Some(queue) =>
        queue.send(job)

      case None =>
        Future.failed(new RuntimeException("`facia.press.queue_url` property not in config, could not enqueue job."))
    }
  }
}

class FaciaPressTopic(val config: ApplicationConfiguration) {
  val maybeTopic = config.faciatool.frontPressToolTopic map { topicArn =>
    val credentials = config.aws.cmsFrontsAccountCredentials
    JsonMessageTopic[PressJob](AmazonSNSAsyncClientBuilder.standard()
      .withCredentials(credentials)
      .withRegion(Regions.EU_WEST_1).build(),
      topicArn
      )
  }

  def publish(job: PressJob): Future[PublishResult] = {
    maybeTopic match {
      case Some(topicArn) =>
        topicArn.send(job)

      case None =>
        Future.failed(new RuntimeException("Could not publish job."))
    }
  }

}

class FaciaPress(val faciaPressQueue: FaciaPressQueue, val faciaPressTopic: FaciaPressTopic, val configAgent: ConfigAgent) extends Logging {
  def press(pressCommand: PressCommand): Future[List[SendMessageResult]] = {
    configAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.collectionIds
        path <- configAgent.getConfigsUsingCollectionId(id)
      } yield path

      lazy val livePress =
        if (pressCommand.live) {
          val fut = Future.traverse(paths)(path => faciaPressQueue.enqueue(PressJob(FrontPath(path), Live, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              logger.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          val fut2 = Future.traverse(paths)(path => faciaPressTopic.publish(PressJob(FrontPath(path), Live, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut2.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              logger.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          fut
        } else {
          Future.successful(Set.empty)
        }

      lazy val draftPress =
        if (pressCommand.draft) {
          val fut = Future.traverse(paths)(path => faciaPressQueue.enqueue(PressJob(FrontPath(path), Draft, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              logger.error("Error manually pressing draft collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          val fut2 = Future.traverse(paths)(path => faciaPressTopic.publish(PressJob(FrontPath(path), Draft, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut2.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              logger.error("Error manually pressing draft collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          fut
        } else Future.successful(Set.empty)

      for {
        live <- livePress
        draft <-  draftPress
      } yield (live ++ draft).toList
    }
  }
}
