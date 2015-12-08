package updates

import java.nio.ByteBuffer

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient
import com.amazonaws.services.kinesis.model.{PutRecordRequest, PutRecordResult}
import conf.{Configuration, aws}
import play.api.Logger
import play.api.libs.json._

object AuditingUpdates {
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

  def putStreamUpdate(streamUpdate: StreamUpdate): Unit =
    Json.toJson(streamUpdate.update).transform[JsObject](Reads.JsObjectReads) match {
      case JsSuccess(jsonObject, _)  => putString(Json.stringify(jsonObject +
        ("email", JsString(streamUpdate.email)) +
        ("fronts", JsArray(streamUpdate.fronts.map(f => JsString(f)).toSeq)) +
        ("date", JsString(streamUpdate.dateTime.toString))
      ))
      case JsError(errors)           => Logger.warn(s"Error converting StreamUpdate: $errors")}

  private def putString(s: String): Unit =
    Configuration.updates.stream.map { streamName =>
      client.putRecordAsync(
        new PutRecordRequest()
          .withData(ByteBuffer.wrap(s.getBytes))
          .withStreamName(streamName)
          .withPartitionKey(partitionKey),
        KinesisLoggingAsyncHandler
      )
    }.getOrElse(Logger.warn("Cannot put to updates stream: Configuration.updates.stream is not set"))
}
