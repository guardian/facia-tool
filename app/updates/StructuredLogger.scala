package updates

import conf.ApplicationConfiguration
import logging.Logging
import net.logstash.logback.marker.Markers
import play.api.libs.json._
import services.ConfigAgent

import scala.jdk.CollectionConverters._

class StructuredLogger(
    val config: ApplicationConfiguration,
    val configAgent: ConfigAgent
) extends Logging {
  def putLog(
      log: LogUpdate,
      level: String = "info",
      error: Option[Exception] = None
  ): Unit = {
    lazy val updatePayload = serializeUpdateMessage(log)
    lazy val shortMessagePayload = serializeShortMessage(log)
    log.fronts(configAgent).foreach { frontId =>
      {
        level match {
          case "info" =>
            logger.underlyingLogger.info(
              createMarkers(log, shortMessagePayload, updatePayload, frontId),
              "Fronts tool: audit"
            )
          case "warn" =>
            logger.underlyingLogger.warn(
              createMarkers(log, shortMessagePayload, updatePayload, frontId),
              "Fronts tool: warning"
            )
          case "error" => {
            val e = error.getOrElse(new Error())
            logger.underlyingLogger.error(
              createMarkers(log, shortMessagePayload, updatePayload, frontId),
              "Fronts tool: error",
              e
            )
          }
        }
      }
    }
  }

  private def createMarkers(
      log: LogUpdate,
      shortMessage: Option[String],
      message: Option[String],
      frontId: String
  ) =
    Markers.appendEntries(
      (
        Map(
          "operation" -> log.update.getClass.getSimpleName,
          "userEmail" -> log.email,
          "date" -> log.dateTime.toString,
          "resourceId" -> frontId
        )
          ++ shortMessage.map("shortMessage" -> _)
          ++ message.map("message" -> _)
      ).asJava
    )

  private def serializeUpdateMessage(log: LogUpdate): Option[String] = {
    Some(Json.toJson(log.update).toString())
  }

  private def serializeShortMessage(log: LogUpdate): Option[String] = {
    log.update match {
      case update: CreateFront =>
        Some(
          Json
            .toJson(
              Json.obj(
                "priority" -> update.priority,
                "email" -> log.email
              )
            )
            .toString
        )
      case update: CollectionCreate =>
        Some(
          Json
            .toJson(
              Json.obj(
                "collectionId" -> update.collectionId,
                "displayName" -> update.collection.displayName
              )
            )
            .toString
        )
      case update: CollectionUpdate =>
        Some(
          Json
            .toJson(
              Json.obj(
                "collectionId" -> update.collectionId
              )
            )
            .toString
        )
      case _ => None
    }
  }
}
