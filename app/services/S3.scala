package services

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.services.s3.model._
import com.amazonaws.util.StringInputStream
import com.gu.pandomainauth.model.User
import conf.{Configuration, aws}
import metrics.S3Metrics.S3ClientExceptionsMetric
import org.joda.time.DateTime
import play.Play
import play.api.Logger

import scala.io.{Codec, Source}

sealed trait S3Accounts {
  def bucket: String
  def client: Option[AmazonS3Client]
}
case object FrontendS3Account extends S3Accounts {
  lazy val bucket = Configuration.aws.bucket
  lazy val client: Option[AmazonS3Client] =
    aws.crossAccount.map{ credentials => {
      val client = new AmazonS3Client(credentials)
      client.setEndpoint(AwsEndpoints.s3)
      client}}
}
case object CmsFrontsS3Account extends S3Accounts {
  lazy val bucket = Configuration.aws.frontsBucket
  lazy val client: Option[AmazonS3Client] =
    aws.credentials.map{ credentials => {
      val client = new AmazonS3Client(credentials)
      client.setEndpoint(AwsEndpoints.s3)
      client}}
}

trait S3 {
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
        Logger.warn("not found at %s - %s" format(account.bucket, key))
        None
      }
      case e: Exception => {
        S3ClientExceptionsMetric.increment()
        throw e
      }
    }
  }

  def get(key: String)(implicit codec: Codec): Option[String] = withS3Result(FrontendS3Account, key) {
    result => Source.fromInputStream(result.getObjectContent).mkString
  }

  def getLastModified(key: String): Option[DateTime] = withS3Result(FrontendS3Account, key) {
    result => new DateTime(result.getObjectMetadata.getLastModified)
  }

  def putPublic(key: String, value: String, contentType: String, accounts: List[S3Accounts]) {
    put(key: String, value: String, contentType: String, PublicRead, accounts)
  }

  def putPrivate(key: String, value: String, contentType: String, accounts: List[S3Accounts]) {
    put(key: String, value: String, contentType: String, Private, accounts)
  }

  private def put(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList, accounts: List[S3Accounts]) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.getBytes("UTF-8").length)

    accounts.foreach(putRequest(_, key, value, metadata, accessControlList))
  }

  private def putRequest(account: S3Accounts, key: String, value: String, metadata: ObjectMetadata, accessControlList: CannedAccessControlList) {
    val request = new PutObjectRequest(account.bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControlList)

    try {
      account.client.foreach(_.putObject(request))
    } catch {
      case e: Exception =>
        S3ClientExceptionsMetric.increment()
        throw e
    }
  }
}

object S3 extends S3

object S3FrontsApi extends S3 {

  lazy val stage = if (Play.isTest) "TEST" else Configuration.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"

  def getLiveFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/fapi/pressed.json"

  def getMasterConfig: Option[String] = get(s"$location/config/config.json")
  def putCollectionJson(id: String, json: String) = {
    val putLocation: String = s"$location/collection/$id/collection.json"
    putPublic(putLocation, json, "application/json", List(FrontendS3Account))
    putPrivate(putLocation, json, "application/json", List(CmsFrontsS3Account))
  }

  def archive(id: String, json: String, identity: User) = {
    val now = DateTime.now
    val putLocation = s"$location/history/collection/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/$id/${now}.${identity.email}.json"
    putPrivate(putLocation, json, "application/json", List(CmsFrontsS3Account))
  }

  def putMasterConfig(json: String) = {
    val putLocation = s"$location/config/config.json"
    putPublic(putLocation, json, "application/json", List(FrontendS3Account))
    putPrivate(putLocation, json, "application/json", List(CmsFrontsS3Account))
  }

  def archiveMasterConfig(json: String, identity: User) = {
    val now = DateTime.now
    val putLocation = s"$location/history/config/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/${now}.${identity.email}.json"
    putPrivate(putLocation, json, "application/json", List(CmsFrontsS3Account))
  }

  def getPressedLastModified(path: String): Option[String] =
    getLastModified(getLiveFapiPressedKeyForPath(path)).map(_.toString)
}
