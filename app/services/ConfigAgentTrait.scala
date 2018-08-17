package services

import akka.agent.Agent
import com.gu.facia.api.models.CollectionConfig
import com.gu.facia.client.models.{ConfigJson => Config}
import conf.ApplicationConfiguration
import logging.Logging
import permissions.PermissionsPriority

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

case class CollectionConfigWithId(id: String, config: CollectionConfig)

class ConfigAgent(val config: ApplicationConfiguration, val frontsApi: FrontsApi) extends Logging {
  private lazy val configAgent = Agent[Option[Config]](None)

  def refresh() = {
    val futureConfig = frontsApi.amazonClient.config
    futureConfig.onComplete {
      case Success(config) => logger.info(s"Successfully got config")
      case Failure(t) => logger.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: Config): Unit = {
    configAgent.send(Option(config))
  }

  def refreshAndReturn(): Future[Option[Config]] =
    frontsApi.amazonClient.config
      .flatMap(config => configAgent.alter{_ => Option(config)})
      .recover{case err =>
        logger.warn("Falling back to current ConfigAgent contents on refreshAndReturn", err)
        configAgent.get()}

  def getBreakingNewsCollectionIds: Set[String] =
    configAgent.get().flatMap(_.fronts.get(config.faciatool.breakingNewsFront).map(_.collections.toSet)).getOrElse(Set.empty)

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

  def getFrontsPermissionsPriorityByCollectionId(id: String): Set[PermissionsPriority] = configAgent.get().map(config => {
    val fronts = config.fronts
    fronts.foldLeft(Set[PermissionsPriority]())((acc, front) => {
      if (front._2.collections.contains(id)) {
        val priority = PermissionsPriority.stringToPermissionPriority(front._2.priority.getOrElse("editorial"))
        priority match {
          case Some(p) => acc + p
          case _ => acc
        }
      } else acc
    })
  }).getOrElse(Set.empty)

}
