package updates

import conf.ApplicationConfiguration
import net.logstash.logback.marker.Markers
import play.api.Logger
import play.api.libs.json._
import services.ConfigAgent

import scala.collection.JavaConverters._

class AuditingUpdates(val config: ApplicationConfiguration, val configAgent: ConfigAgent) {
  def putAudit(audit: AuditUpdate): Unit = {
    lazy val updatePayload = serializeUpdateMessage(audit)
    lazy val shortMessagePayload = serializeShortMessage(audit)

    audit.fronts(configAgent).foreach { frontId =>
      Logger.logger.info(createMarkers(audit, shortMessagePayload, updatePayload, frontId), "Fronts Audit")
    }
  }

  private def createMarkers(audit: AuditUpdate, shortMessage: Option[String], message: Option[String], frontId: String) =
    Markers.appendEntries((
      Map(
        "operation" -> audit.update.getClass.getSimpleName,
        "userEmail" -> audit.email,
        "date" -> audit.dateTime.toString,
        "resourceId" -> frontId
      )
      ++ shortMessage.map("shortMessage" -> _)
      ++ message.map("message" -> _)
    ).asJava
  )

  private def serializeUpdateMessage(audit: AuditUpdate): Option[String] = {
    Some(Json.toJson(audit.update).toString())
  }

  private def serializeShortMessage(audit: AuditUpdate): Option[String] = {
    audit.update match {
      case update: CreateFront => Some(Json.toJson(Json.obj(
        "priority" -> update.priority,
        "email" -> audit.email
      )).toString)
      case update: CollectionCreate => Some(Json.toJson(Json.obj(
        "collectionId" -> update.collectionId,
        "displayName" -> update.collection.displayName
      )).toString)
      case update: CollectionUpdate => Some(Json.toJson(Json.obj(
        "collectionId" -> update.collectionId
      )).toString)
      case _ => None
    }
  }
}
