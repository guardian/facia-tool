package services

import com.amazonaws.regions.Regions
import com.amazonaws.services.sns.AmazonSNSAsyncClientBuilder
import com.amazonaws.services.sns.model.PublishResult
import com.amazonaws.services.sqs.AmazonSQSAsyncClientBuilder
import com.amazonaws.services.sqs.model.SendMessageResult
import com.gu.facia.api.models.faciapress.{
  Draft,
  FrontPath,
  Live,
  PressJob,
  PressType
}
import conf.ApplicationConfiguration
import logging.Logging
import metrics.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}
import play.api.libs.json.Json
import play.api.libs.json.JsObject

case class PressCommand(
    collectionIds: Set[String],
    live: Boolean = false,
    draft: Boolean = false,
    forceConfigUpdate: Option[Boolean] = Option(false)
) {
  def withPressLive(b: Boolean = true): PressCommand = this.copy(live = b)
  def withPressDraft(b: Boolean = true): PressCommand = this.copy(draft = b)
  def withForceConfigUpdate(b: Boolean = true): PressCommand =
    this.copy(forceConfigUpdate = Option(b))
}

object PressCommand {
  def forOneId(id: String): PressCommand = PressCommand(Set(id))
}

class FaciaPressTopic(val config: ApplicationConfiguration) {
  val maybeTopic = config.faciatool.frontPressToolTopic map { topicArn =>
    val credentials = config.aws.cmsFrontsAccountCredentials
    JsonMessageTopic[PressJob](
      AmazonSNSAsyncClientBuilder
        .standard()
        .withCredentials(credentials)
        .withRegion(Regions.EU_WEST_1)
        .build(),
      topicArn
    )
  }

  def publish(
      job: PressJob,
      collectionIds: Set[String] = Set()
  ): Future[PublishResult] = {
    maybeTopic match {
      case Some(topic) if collectionIds.nonEmpty =>
        import SNSTopics._
        val event = Json.toJson(job).as[JsObject] ++ JsObject(
          Map("collectionIds" -> Json.toJson(collectionIds))
        )
        topic.client.publishMessageFuture(topic.topicArn, Json.stringify(event))

      case Some(topic) =>
        topic.send(job)

      case None =>
        Future.failed(new RuntimeException("Could not publish job."))
    }
  }

}

class FaciaPress(
    val faciaPressTopic: FaciaPressTopic,
    val configAgent: ConfigAgent
) extends Logging {
  def press(pressCommand: PressCommand): Future[List[PublishResult]] = {
    configAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.collectionIds
        path <- configAgent.getConfigsUsingCollectionId(id)
      } yield path

      val pathToCollectionIdsLookup = configAgent.getConfigCollectionMap

      def sendEvents(pressType: PressType) = Future.traverse(
        paths.filter(_ =>
          pressType match {
            case Live  => pressCommand.live
            case Draft => pressCommand.draft
          }
        )
      ) { path =>
        val event = PressJob(
          FrontPath(path),
          pressType,
          forceConfigUpdate = pressCommand.forceConfigUpdate
        )

        val collectionIdsRelevantToPath =
          pressCommand.collectionIds.filter(collectionId => {
            pathToCollectionIdsLookup.get(path).exists(_.contains(collectionId))
          })

        val publishResultFuture =
          faciaPressTopic.publish(event, collectionIdsRelevantToPath)

        publishResultFuture.onComplete {
          case Failure(error) =>
            logger.error(
              s"Error publishing to the SNS topic, $pressType event: $event",
              error
            )
            EnqueuePressFailure.increment()
          case Success(_) =>
            logger.info(s"Published to the SNS topic, $pressType event: $event")
            EnqueuePressSuccess.increment()
        }

        publishResultFuture
      }

      for {
        live <- sendEvents(Live)
        draft <- sendEvents(Draft)
      } yield (live ++ draft).toList
    }
  }
}
