package updates

import java.nio.ByteBuffer

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient
import com.amazonaws.services.kinesis.model.{PutRecordRequest, PutRecordResult}
import com.gu.auditing.model.v1.{App, Notification}
import com.gu.thrift.serializer.{GzipType, ThriftSerializer}
import conf.ApplicationConfiguration
import play.api.Logger
import play.api.libs.json._
import services.ConfigAgent

class AuditingUpdates(val config: ApplicationConfiguration, val configAgent: ConfigAgent) {
  val partitionKey: String = "facia-tool-updates"

  object KinesisLoggingAsyncHandler extends AsyncHandler[PutRecordRequest, PutRecordResult] {
    def onError(exception: Exception) {
      Logger.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutRecordRequest, result: PutRecordResult) {
      Logger.info(s"Put auditing message to stream:${request.getStreamName} Seq:${result.getSequenceNumber}")
    }
  }

  val client: AmazonKinesisAsyncClient = {
    val c = new AmazonKinesisAsyncClient(config.aws.mandatoryCredentials)
    c.setRegion(Region.getRegion(Regions.EU_WEST_1))
    c
  }

  def putStreamUpdate(streamUpdate: StreamUpdate): Unit = {
    val updateName = streamUpdate.update.getClass.getSimpleName
    lazy val updatePayload = serializeUpdateMessage(streamUpdate)
    lazy val shortMessagePayload = serializeShortMessage(streamUpdate)
    lazy val expiryDate = computeExpiryDate(streamUpdate)


    streamUpdate.fronts(configAgent).foreach(frontId => putAuditingNotification(
      Notification(
        app = App.FaciaTool,
        operation = updateName,
        userEmail = streamUpdate.email,
        date = streamUpdate.dateTime.toString,
        resourceId = Some(frontId),
        message = updatePayload,
        shortMessage = shortMessagePayload,
        expiryDate = expiryDate
      )))
  }

  private def serializeUpdateMessage(streamUpdate: StreamUpdate): Option[String] = {
    Some(Json.toJson(streamUpdate.update).toString())
  }

  private def serializeShortMessage(streamUpdate: StreamUpdate): Option[String] = {
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

  private def computeExpiryDate(streamUpdate: StreamUpdate): Option[String] = {
    streamUpdate.update match {
      case _: CreateFront => None
      case _: CollectionCreate => None
      case _ => Some(streamUpdate.dateTime.plusMonths(1).toString)
    }
  }

  private def putAuditingNotification(notification: Notification): Unit = {

    val streamName = config.auditing.stream
    val bytes = ThriftSerializer.serializeToBytes(notification, Some(GzipType), None)
    if (bytes.length > config.auditing.maxDataSize) {
      Logger.error(s"$streamName - NOT sending because size (${bytes.length} bytes) is larger than max kinesis size(${config.auditing.maxDataSize})")
    } else {
      Logger.info(s"$streamName - sending auditing thrift update with size of ${bytes.length} bytes")
      client.putRecordAsync(
        new PutRecordRequest()
          .withData(ByteBuffer.wrap(bytes))
          .withStreamName(streamName)
          .withPartitionKey(partitionKey),
        KinesisLoggingAsyncHandler
      )
    }
  }
}
