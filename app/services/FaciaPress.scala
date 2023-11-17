package services

import com.amazonaws.regions.Regions
import com.amazonaws.services.sns.AmazonSNSAsyncClientBuilder
import com.amazonaws.services.sns.model.PublishResult
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.SendMessageResult
import com.gu.facia.api.models.faciapress.{Draft, FrontPath, Live, PressJob, PressType}
import conf.ApplicationConfiguration
import logging.Logging
import metrics.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}

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

      def sendEvents(pressType: PressType) = {
        val result = Future.traverse(paths.filter(_ => pressType match {
          case Live => pressCommand.live
          case Draft => pressCommand.draft
        })) { path =>
          val event = PressJob(FrontPath(path), pressType, forceConfigUpdate = pressCommand.forceConfigUpdate)

          faciaPressTopic.publish(event).onComplete { // fire & forget (but log)
            case Failure(error) => logger.error(s"Error publishing to the SNS topic, $pressType event: $event", error)
            case Success(_) => logger.info(s"Published to the SNS topic, $pressType event: $event")
          }

          faciaPressQueue.enqueue(event)
        }
        result.onComplete {
          case Failure(error) =>
            EnqueuePressFailure.increment()
            logger.error(s"Error manually pressing $pressType collection through update from tool", error)
          case Success(_) =>
            EnqueuePressSuccess.increment()
        }
        result
      }

      for {
        live <- sendEvents(Live)
        draft <- sendEvents(Draft)
      } yield (live ++ draft).toList
    }
  }
}
