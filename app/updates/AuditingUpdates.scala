package updates

import java.nio.ByteBuffer

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient
import com.amazonaws.services.kinesis.model.{PutRecordRequest, PutRecordResult}
import com.gu.auditing.model.v1.{App, Notification}
import com.gu.thrift.serializer.ThriftSerializer
import conf.{Configuration, aws}
import play.api.Logger
import play.api.libs.json._

object AuditingUpdates extends ThriftSerializer {
  val partitionKey: String = "facia-tool-updates"

  object KinesisLoggingAsyncHandler extends AsyncHandler[PutRecordRequest, PutRecordResult] {
    def onError(exception: Exception) {
      Logger.error(s"Kinesis PutRecord request error: ${exception.getMessage}}")
    }
    def onSuccess(request: PutRecordRequest, result: PutRecordResult) {
      Logger.info(s"Put diff to stream:${request.getStreamName} Seq:${result.getSequenceNumber}")
    }
  }

  val client: AmazonKinesisAsyncClient = {
    val c = new AmazonKinesisAsyncClient(aws.mandatoryCredentials)
    c.setRegion(Region.getRegion(Regions.EU_WEST_1))
    c
  }

  def putStreamUpdate(streamUpdate: StreamUpdate): Unit = {

    val updateName = streamUpdate.update.getClass().getSimpleName()

    val message: String = getStringMessage(streamUpdate).getOrElse("")
    streamUpdate.fronts.map(frontId => {
      val notification = Notification(frontId, updateName, streamUpdate.email, App.FaciaTool, message,
        streamUpdate.dateTime.toString())

      putAuditingNotification(notification)
    })

  }

  private def putAuditingNotification(notification: Notification): Unit = {

    val streamName = Configuration.auditing.stream
    val bytes = serializeToBytes(notification)
    if (bytes.length > Configuration.auditing.maxDataSize) {
      Logger.error(s"$streamName - NOT sending because size (${bytes.length} bytes) is larger than max kinesis size(${Configuration.auditing.maxDataSize})")
    } else {
      Logger.info(s"$streamName - sending thrift update with size of ${bytes.length} bytes")
      client.putRecordAsync(
        new PutRecordRequest()
          .withData(ByteBuffer.wrap(bytes))
          .withStreamName(streamName)
          .withPartitionKey(partitionKey),
        KinesisLoggingAsyncHandler
      )
    }
  }

  private def getStringMessage(streamUpdate: StreamUpdate): Option[String] = {
    Json.toJson(streamUpdate.update).transform[JsObject](Reads.JsObjectReads) match {
      case JsSuccess(jsonObject, _) => Some(Json.stringify(jsonObject +
        ("email", JsString(streamUpdate.email)) +
        ("fronts", JsArray(streamUpdate.fronts.map(f => JsString(f)).toSeq)) +
        ("date", JsString(streamUpdate.dateTime.toString)))
      )
      case JsError(errors) => {
        Logger.warn(s"Error converting StreamUpdate: $errors")
        None
      }
    }
  }
}
