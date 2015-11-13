package services

import com.gu.facia.api.models.CollectionConfig
import com.gu.facia.client.models.{ConfigJson => Config}
import common._
import fronts.FrontsApi
import play.api.{Application, GlobalSettings}

import scala.concurrent.Future
import scala.util.{Failure, Success}

case class CollectionConfigWithId(id: String, config: CollectionConfig)

trait ConfigAgentTrait extends ExecutionContexts with Logging {
  private lazy val configAgent = AkkaAgent[Option[Config]](None)

  def refresh() = {
    val futureConfig = FrontsApi.amazonClient.config
    futureConfig.onComplete {
      case Success(config) => log.info(s"Successfully got config")
      case Failure(t) => log.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: Config): Unit = {
    configAgent.send(Option(config))
  }

  def refreshAndReturn(): Future[Option[Config]] =
    FrontsApi.amazonClient.config
      .flatMap(config => configAgent.alter{_ => Option(config)})
      .fallbackTo{
      log.warn("Falling back to current ConfigAgent contents on refreshAndReturn")
      Future.successful(configAgent.get())
    }

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

    Jobs.deschedule("ConfigAgentJob")
    Jobs.schedule("ConfigAgentJob", "0 * * * * ?") {
      ConfigAgent.refresh()
    }

    AkkaAsync {
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("ConfigAgentJob")
    super.onStop(app)
  }
}
