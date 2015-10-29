package switchServices

import conf.{aws, Configuration}
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import common.Logging
import common.S3Metrics.S3ClientExceptionsMetric
import scala.io.{Codec, Source}
import services.AwsEndpoints

trait switch extends Logging {

  lazy val bucket = Configuration.switchBoard.bucket

  lazy val client: Option[AmazonS3Client] = aws.credentials.map{ credentials =>
    val client = new AmazonS3Client(credentials)
    client.setEndpoint(AwsEndpoints.s3)
    client
  }

  def get(key: String)(implicit codec: Codec): Option[String] = withS3Result(key) {
    result => Source.fromInputStream(result.getObjectContent).mkString
  }

  private def withS3Result[T](key: String)(action: S3Object => T): Option[T] = client.flatMap { client =>
    try {

      val request = new GetObjectRequest(bucket, key)
      val result = client.getObject(request)

      // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
      try {
        Some(action(result))
      }
      catch {
        case e: Exception =>
          S3ClientExceptionsMetric.increment()
          throw e
      }
      finally {
        result.close()
      }
    } catch {
      case e: AmazonS3Exception if e.getStatusCode == 404 => {
        log.warn("not found at %s - %s" format(bucket, key))
        None
      }
      case e: Exception => {
        S3ClientExceptionsMetric.increment()
        throw e
      }
    }
  }
}

object switch extends switch

