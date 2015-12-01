package services

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.SendMessageResult
import conf.{Configuration, aws}
import metrics.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}
import play.api.Logger

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

object FaciaPressQueue {
  val maybeQueue = Configuration.faciatool.frontPressToolQueue map { queueUrl =>
    val credentials = aws.mandatoryCrossAccountCredentials
    JsonMessageQueue[PressJob](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
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

object FaciaPress {
  def press(pressCommand: PressCommand): Future[List[SendMessageResult]] = {
    ConfigAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.collectionIds
        path <- ConfigAgent.getConfigsUsingCollectionId(id)
      } yield path

      lazy val livePress =
        if (pressCommand.live) {
          val fut = Future.traverse(paths)(path => FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              Logger.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          fut
        } else {
          Future.successful(Set.empty)
        }

      lazy val draftPress =
        if (pressCommand.draft) {
          val fut = Future.traverse(paths)(path => FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft, forceConfigUpdate = pressCommand.forceConfigUpdate)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              Logger.error("Error manually pressing live collection through update from tool", error)
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
