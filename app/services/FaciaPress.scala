package services

import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.regions.Regions
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.SendMessageResult
import com.gu.facia.api.models.faciapress.{Draft, FrontPath, Live, PressJob, PressType}
import conf.ApplicationConfiguration
import metrics.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}
import logging.Logging

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

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

trait PressQueue {
  val queueUrl: Option[String]
  val credentials: AWSCredentialsProvider
  val maybeQueue = queueUrl.map { url =>
    JsonMessageQueue[PressJob](
      AmazonSQSAsyncClientBuilder.standard()
        .withCredentials(credentials)
        .withRegion(Regions.EU_WEST_1).build(),
      url
    )
  }
  def enqueue(job: PressJob): Future[SendMessageResult] = {
    maybeQueue match {
      case Some(queue) =>
        queue.send(job)

      case None =>
        Future.failed(new RuntimeException("Queue property not in config, could not enqueue job."))
    }
  }
}

class FaciaPressQueue(val config: ApplicationConfiguration) extends PressQueue {
  override val queueUrl: Option[String] = config.faciatool.frontPressToolQueue
  override val credentials: AWSCredentialsProvider = config.aws.frontendAccountCredentials
}

class MapiFrontEventQueue(val config: ApplicationConfiguration) extends PressQueue {
  override val queueUrl: Option[String] = config.faciatool.mapiFrontEventQueue
  override val credentials: AWSCredentialsProvider = config.aws.mapiAccountCredentials
}

class FaciaPress(val frontendQueue: PressQueue, val mapiQueue: PressQueue, val configAgent: ConfigAgent) extends Logging {
  def press(pressCommand: PressCommand): Future[List[SendMessageResult]] = {
    configAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.collectionIds
        path <- configAgent.getConfigsUsingCollectionId(id)
      } yield path

      val pressType = if (pressCommand.live) {
        Live
      } else {
        Draft
      }

      val pressJobs = paths.map { path =>
        PressJob(FrontPath(path), pressType, forceConfigUpdate = pressCommand.forceConfigUpdate)
      }
      val fut = Future.traverse(pressJobs)(frontendQueue.enqueue)
      fut.onComplete {
        case Failure(error) =>
          EnqueuePressFailure.increment()
          logger.error("Error manually pressing live collection through update from tool", error)
        case Success(_) =>
          EnqueuePressSuccess.increment()
      }
      fut
    }
  }
}
