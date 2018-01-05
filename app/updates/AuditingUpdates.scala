package updates

import com.gu.thrift.serializer.{GzipType, ThriftSerializer}
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
    lazy val expiryDate = computeExpiryDate(audit)

    audit.fronts(configAgent).foreach { frontId =>
      Logger.logger.info(createMarkers(audit, expiryDate, shortMessagePayload, updatePayload, frontId), "Fronts Audit")
    }
  }

  private def createMarkers(streamUpdate: AuditUpdate, expiryDate: Option[String], shortMessage: Option[String], message: Option[String], frontId: String) =
    Markers.appendEntries((
      Map(
        "operation" -> streamUpdate.update.getClass.getSimpleName,
        "userEmail" -> streamUpdate.email,
        "date" -> streamUpdate.dateTime.toString,
        "resourceId" -> frontId
      )
      ++ expiryDate.map("expiryDate" -> _)
      ++ shortMessage.map("shortMessage" -> _)
      ++ message.map("message" -> _)
    ).asJava
  )

  private def serializeUpdateMessage(streamUpdate: AuditUpdate): Option[String] = {
    Some(Json.toJson(streamUpdate.update).toString())
  }

  private def serializeShortMessage(streamUpdate: AuditUpdate): Option[String] = {
    streamUpdate.update match {
      case update: CreateFront => Some(Json.toJson(Json.obj(
        "priority" -> update.priority,
        "email" -> streamUpdate.email
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

  private def computeExpiryDate(streamUpdate: AuditUpdate): Option[String] = {
    streamUpdate.update match {
      case _: CreateFront => None
      case _: CollectionCreate => None
      case _ => Some(streamUpdate.dateTime.plusMonths(1).toString)
    }
  }
}
