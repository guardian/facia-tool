package services

import _root_.metrics.S3Metrics.S3ClientExceptionsMetric
import com.gu.pandomainauth.model.User
import conf.ApplicationConfiguration
import org.joda.time.DateTime
import logging.Logging
import software.amazon.awssdk.auth.credentials.{
  AwsBasicCredentials,
  AwsCredentialsProvider,
  StaticCredentialsProvider
}
import software.amazon.awssdk.core.ResponseInputStream
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.{
  GetObjectRequest,
  GetObjectResponse,
  ObjectCannedACL,
  PutObjectRequest,
  PutObjectResponse,
  S3Exception
}

import java.net.URI
import scala.io.{Codec, Source}

sealed trait S3Accounts {
  def bucket: String
  def client: Option[S3Client]
}
case class CmsFrontsS3Account(
    config: ApplicationConfiguration
) extends S3Accounts {
  lazy val bucket = config.aws.frontsBucket

  lazy val client: Option[S3Client] =
    config.aws.newStyleCredentials.map(credentials =>
      S3.client(credentials, config.aws.region, config.aws.localS3Endpoint)
    )
}

object S3 {
  def client(
      credentials: AwsCredentialsProvider,
      region: String,
      localS3Endpoint: Option[String] = None
  ): S3Client =
    localS3Endpoint match {
      case Some(endpoint) =>
        S3Client
          .builder()
          .credentialsProvider(
            StaticCredentialsProvider.create(
              AwsBasicCredentials.create("test", "test")
            )
          )
          .region(Region.of(region))
          .endpointOverride(URI.create(endpoint))
          .forcePathStyle(true)
          .build()
      case None =>
        S3Client
          .builder()
          .credentialsProvider(credentials)
          .region(Region.of(region))
          .build()
    }
}

trait S3 extends Logging {
  def cmsFrontsS3Account: CmsFrontsS3Account

  private def withS3Result[T](
      account: S3Accounts,
      key: String
  )(
      action: ResponseInputStream[GetObjectResponse] => T
  ): Option[T] = account.client.flatMap { client =>
    try {

      val request =
        GetObjectRequest.builder().bucket(account.bucket).key(key).build()
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
      case e: S3Exception if e.statusCode == 404 => {
        logger.warn(
          "S3: attempted to get, but not found at %s - %s" format (account.bucket, key)
        )
        None
      }
      case e: Exception => {
        logger.error(
          "S3: attempted to get, but got an error at %s - %s" format (account.bucket, key),
          e
        )
        S3ClientExceptionsMetric.increment()
        throw e
      }
    }
  }

  def get(key: String)(implicit codec: Codec): Option[String] =
    withS3Result(cmsFrontsS3Account, key) { result =>
      Source.fromInputStream(result).mkString
    }

  def getLastModified(key: String): Option[DateTime] =
    withS3Result(cmsFrontsS3Account, key) { result =>
      new DateTime(result.response().lastModified().toEpochMilli)
    }

  def putPublic(
      key: String,
      value: String,
      contentType: String,
      accounts: List[S3Accounts]
  ): Unit = {
    put(key, value, contentType, ObjectCannedACL.PUBLIC_READ, accounts)
  }

  def putPrivate(
      key: String,
      value: String,
      contentType: String,
      accounts: List[S3Accounts]
  ): Unit = {
    put(key, value, contentType, ObjectCannedACL.PRIVATE, accounts)
  }

  private def put(
      key: String,
      value: String,
      contentType: String,
      accessControlList: ObjectCannedACL,
      accounts: List[S3Accounts]
  ): Unit = {
    val bytes = value.getBytes("UTF-8")
    accounts.map(putRequest(_, key, bytes, contentType, accessControlList))
  }

  private def putRequest(
      account: S3Accounts,
      key: String,
      bytes: Array[Byte],
      contentType: String,
      accessControlList: ObjectCannedACL
  ): Option[PutObjectResponse] = {
    val request = PutObjectRequest
      .builder()
      .bucket(account.bucket)
      .key(key)
      .contentType(contentType)
      .contentLength(bytes.length.toLong)
      .cacheControl("no-cache,no-store")
      .acl(accessControlList)
      .build()

    try {
      account.client.map(_.putObject(request, RequestBody.fromBytes(bytes)))
    } catch {
      case e: Exception =>
        logger.error(
          "S3: attempted to put, but got an error at %s - %s" format (account.bucket, key),
          e
        )
        S3ClientExceptionsMetric.increment()
        throw e
    }
  }
}

class S3FrontsApi(
    val config: ApplicationConfiguration,
    val isTest: Boolean
) extends S3 {

  lazy val stage = if (isTest) "TEST" else config.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"
  val cmsFrontsS3Account = new CmsFrontsS3Account(config)

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

  val customSubnavKey = s"$location/navigation/custom-subnav.json"

  def getCustomSubnav: Option[String] = get(customSubnavKey)

  def putCustomSubnav(json: String): Unit =
    putPrivate(
      customSubnavKey,
      json,
      "application/json",
      List(cmsFrontsS3Account)
    )

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
