package services

import akka.agent.Agent
import com.gu.facia.api.models.CollectionConfig
import com.gu.facia.client.models.{ConfigJson => Config}
import conf.Configuration
import play.api.{Application, GlobalSettings, Logger}
import play.libs.Akka

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success}

case class CollectionConfigWithId(id: String, config: CollectionConfig)

trait ConfigAgentTrait {
  private lazy val configAgent = Agent[Option[Config]](None)

  def refresh() = {
    val futureConfig = FrontsApi.amazonClient.config
    futureConfig.onComplete {
      case Success(config) => Logger.info(s"Successfully got config")
      case Failure(t) => Logger.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: Config): Unit = {
    configAgent.send(Option(config))
  }

  def refreshAndReturn(): Future[Option[Config]] =
    FrontsApi.amazonClient.config
      .flatMap(config => configAgent.alter{_ => Option(config)})
      .recover{case err =>
        Logger.warn("Falling back to current ConfigAgent contents on refreshAndReturn", err)
        configAgent.get()}

  def getBreakingNewsCollectionIds: Set[String] =
    configAgent.get().flatMap(_.fronts.get(Configuration.faciatool.breakingNewsFront).map(_.collections.toSet)).getOrElse(Set.empty)

  def isCollectionInBreakingNewsFront(collection: String): Boolean =
    (getBreakingNewsCollectionIds intersect Set(collection)).nonEmpty

  def getConfigCollectionMap: Map[String, Seq[String]] = {
    val config = configAgent.get()
    config.map(_.fronts.mapValues(_.collections)).getOrElse(Map.empty)
  }

  def getConfigsUsingCollectionId(id: String): Seq[String] = {
    (getConfigCollectionMap collect {
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }).toSeq
  }

  def getConfig(id: String): Option[CollectionConfig] = configAgent.get().flatMap(_.collections.get(id).map(CollectionConfig.fromCollectionJson))

}

object ConfigAgent extends ConfigAgentTrait

trait ConfigAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)
    Akka.system.scheduler.schedule(initialDelay = 1.seconds, interval = 1.minute) { ConfigAgent.refresh() }
  }
}
