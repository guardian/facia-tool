package switchboard

import logging.Logging
import play.api.libs.json.{JsError, JsSuccess, Json}
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.{GetObjectRequest, S3Exception}

import scala.util.{Failure, Success, Try}

class S3client(conf: SwitchboardConfiguration) extends Logging {

  lazy val bucket = conf.bucket
  lazy val objectKey = conf.objectKey

  lazy val client: S3Client =
    S3Client
      .builder()
      .credentialsProvider(conf.credentials)
      .region(Region.of(conf.region))
      .build()

  def getSwitches(): Option[Map[String, Boolean]] = {
    val request =
      GetObjectRequest.builder().bucket(bucket).key(objectKey).build()
    val t = Try(client.getObjectAsBytes(request)) flatMap { result =>
      val resultAsString: String = result.asUtf8String()
      Try(Json.parse(resultAsString)).map { json =>
        json.validate[Map[String, Boolean]] match {
          case JsSuccess(m, _) => {
            logger.info(
              "successfully got switches from switchboard at %s - %s" format (bucket, objectKey)
            )
            json.asOpt[Map[String, Boolean]]
          }
          case JsError(_) => {
            logger.error(
              "invalid json content at %s - %s : %s" format (bucket, objectKey, resultAsString)
            )
            None
          }
        }
      }
    }

    t match {
      case Success(result) => result
      case Failure(e: S3Exception) if e.statusCode == 404 => {
        logger.warn(
          "switches status not found at %s - %s" format (bucket, objectKey)
        )
        None
      }
      case Failure(e) => {
        logger.error("Failure in switchboard S3 getSwitches", e)
        None
      }
    }
  }
}
