package services

import _root_.metrics.S3Metrics.S3ClientExceptionsMetric
import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.services.s3.model.CannedAccessControlList.{
  Private,
  PublicRead
}
import com.amazonaws.services.s3.model._
import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
import com.amazonaws.util.StringInputStream
import com.gu.pandomainauth.model.User
import conf.ApplicationConfiguration
import org.joda.time.DateTime
import logging.Logging

import scala.io.{Codec, Source}

sealed trait S3Accounts {
  def bucket: String
  def client: Option[AmazonS3]
}
case class CmsFrontsS3Account(
    config: ApplicationConfiguration,
    awsEndpoints: AwsEndpoints
) extends S3Accounts {
  lazy val bucket = config.aws.frontsBucket

  lazy val client: Option[AmazonS3] =
    config.aws.credentials.map(credentials =>
      S3.client(credentials, config.aws.region)
    )
}

object S3 {
  def client(credentials: AWSCredentialsProvider, region: String): AmazonS3 = {
    AmazonS3ClientBuilder
      .standard()
      .withCredentials(credentials)
      .withRegion(region)
      .build()
  }
}

trait S3 extends Logging {
  def cmsFrontsS3Account: CmsFrontsS3Account

  private def withS3Result[T](
      account: S3Accounts,
      key: String
  )(action: S3Object => T): Option[T] = account.client.flatMap { client =>
    try {

      val request = new GetObjectRequest(account.bucket, key)
      val result = client.getObject(request)

      // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
      try {
        Some(action(result))
      } catch {
        case e: Exception =>
          S3ClientExceptionsMetric.increment()
          throw e
      } finally {
        result.close()
      }
    } catch {
      case e: AmazonS3Exception if e.getStatusCode == 404 => {
        logger.warn(
          "S3: attempted to get, but not found at %s - %s" format (
            account.bucket,
            key
          )
        )
        None
      }
      case e: Exception => {
        logger.error(
          "S3: attempted to get, but got an error at %s - %s" format (
            account.bucket,
            key
          ),
          e
        )
        S3ClientExceptionsMetric.increment()
        throw e
      }
    }
  }

  def get(key: String)(implicit codec: Codec): Option[String] =
    withS3Result(cmsFrontsS3Account, key) { result =>
      Source.fromInputStream(result.getObjectContent).mkString
    }

  def getLastModified(key: String): Option[DateTime] =
    withS3Result(cmsFrontsS3Account, key) { result =>
      new DateTime(result.getObjectMetadata.getLastModified)
    }

  def putPublic(
      key: String,
      value: String,
      contentType: String,
      accounts: List[S3Accounts]
  ): Unit = {
    put(key: String, value: String, contentType: String, PublicRead, accounts)
  }

  def putPrivate(
      key: String,
      value: String,
      contentType: String,
      accounts: List[S3Accounts]
  ): Unit = {
    put(key: String, value: String, contentType: String, Private, accounts)
  }

  private def put(
      key: String,
      value: String,
      contentType: String,
      accessControlList: CannedAccessControlList,
      accounts: List[S3Accounts]
  ): Unit = {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.getBytes("UTF-8").length)

    accounts.map(putRequest(_, key, value, metadata, accessControlList))
  }

  private def putRequest(
      account: S3Accounts,
      key: String,
      value: String,
      metadata: ObjectMetadata,
      accessControlList: CannedAccessControlList
  ): Option[PutObjectResult] = {
    val request = new PutObjectRequest(
      account.bucket,
      key,
      new StringInputStream(value),
      metadata
    ).withCannedAcl(accessControlList)

    try {
      account.client.map(_.putObject(request))
    } catch {
      case e: Exception =>
        logger.error(
          "S3: attempted to put, but got an error at %s - %s" format (
            account.bucket,
            key
          ),
          e
        )
        S3ClientExceptionsMetric.increment()
        throw e
    }
  }
}

class S3FrontsApi(
    val config: ApplicationConfiguration,
    val isTest: Boolean,
    val awsEndpoints: AwsEndpoints
) extends S3 {

  lazy val stage = if (isTest) "TEST" else config.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"
  val cmsFrontsS3Account = new CmsFrontsS3Account(config, awsEndpoints)

  def getLiveFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/fapi/pressed.json"

  def getMasterConfig: Option[String] = get(s"$location/config/config.json")
  def putCollectionJson(id: String, json: String) = {
    val putLocation: String = s"$location/collection/$id/collection.json"
    putPrivate(putLocation, json, "application/json", List(cmsFrontsS3Account))
  }

  def archive(id: String, json: String, identity: User) = {
    val now = DateTime.now
    val putLocation =
      s"$location/history/collection/${now.year.get}/${"%02d".format(
          now.monthOfYear.get
        )}/${"%02d".format(now.dayOfMonth.get)}/$id/${now}.${identity.email}.json"
    putPrivate(putLocation, json, "application/json", List(cmsFrontsS3Account))
  }

  def putMasterConfig(json: String) = {
    val putLocation = s"$location/config/config.json"
    putPrivate(putLocation, json, "application/json", List(cmsFrontsS3Account))
  }

  def archiveMasterConfig(json: String, identity: User) = {
    val now = DateTime.now
    val putLocation =
      s"$location/history/config/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d"
          .format(now.dayOfMonth.get)}/${now}.${identity.email}.json"
    putPrivate(putLocation, json, "application/json", List(cmsFrontsS3Account))
  }

  def getPressedLastModified(path: String): Option[String] =
    getLastModified(getLiveFapiPressedKeyForPath(path)).map(_.toString)
}
