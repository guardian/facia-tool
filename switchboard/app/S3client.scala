package switchboard

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import play.api.Logger
import play.api.libs.json.{JsError, JsSuccess, Json}
import services.AwsEndpoints

import scala.io.Source
import scala.util.{Failure, Success, Try}

class S3client (conf: SwitchboardConfiguration) {

  lazy val bucket = conf.bucket
  lazy val objectKey = conf.objectKey

  lazy val client: AmazonS3Client = {
    val client = new AmazonS3Client(conf.credentials)
    client.setEndpoint(AwsEndpoints.s3)
    client
  }

  def getSwitches(): Option[Map[String, Boolean]] = {
    val request: GetObjectRequest = new GetObjectRequest(bucket, objectKey)
    val t = Try[S3Object](client.getObject(request)) flatMap { result =>
      val resultAsString: String = Source.fromInputStream(result.getObjectContent).mkString
      result.close()
      Try(Json.parse(resultAsString)).map { json =>
        json.validate[Map[String, Boolean]] match {
          case JsSuccess(m, _) => {
            Logger.info("successfully got switches from switchboard at %s - %s" format(bucket, objectKey))
            json.asOpt[Map[String, Boolean]]}
          case JsError(_) => {
            Logger.error("invalid json content at %s - %s : %s" format(bucket, objectKey, resultAsString))
            None}}}}

    t match {
      case Success(result) => result
      case Failure(e: AmazonS3Exception) if e.getStatusCode == 404 => {
        Logger.warn("switches status not found at %s - %s" format(bucket, objectKey))
        None}
      case Failure(e) => {
        Logger.error("Failure in switchboard S3 getSwitches", e)
        None}}
  }
}
