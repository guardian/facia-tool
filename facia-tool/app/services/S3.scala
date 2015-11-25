package services

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.services.s3.model._
import com.amazonaws.util.StringInputStream
import com.gu.pandomainauth.model.User
import common.Logging
import conf.{Configuration, aws}
import metrics.S3Metrics.S3ClientExceptionsMetric
import org.joda.time.DateTime
import play.Play

import scala.io.{Codec, Source}

trait S3 extends Logging {

  lazy val bucket = Configuration.aws.bucket

  lazy val client: Option[AmazonS3Client] = {
    if (Configuration.aws.crossAccount) aws.crossAccount
    else aws.credentials
  }
    .map{ credentials => {
      val client = new AmazonS3Client(credentials)
      client.setEndpoint(AwsEndpoints.s3)
      client
    }
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

  def get(key: String)(implicit codec: Codec): Option[String] = withS3Result(key) {
    result => Source.fromInputStream(result.getObjectContent).mkString
  }


  def getWithLastModified(key: String): Option[(String, DateTime)] = withS3Result(key) {
    result =>
      val content = Source.fromInputStream(result.getObjectContent).mkString
      val lastModified = new DateTime(result.getObjectMetadata.getLastModified)
      (content, lastModified)
  }

  def getLastModified(key: String): Option[DateTime] = withS3Result(key) {
    result => new DateTime(result.getObjectMetadata.getLastModified)
  }

  def putPublic(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, PublicRead)
  }

  def putPrivate(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, Private)
  }

  private def put(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.getBytes("UTF-8").length)

    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControlList)

    try {
      client.foreach(_.putObject(request))
    } catch {
      case e: Exception =>
        S3ClientExceptionsMetric.increment()
        throw e
    }
  }
}

object S3 extends S3

object S3FrontsApi extends S3 {

  override lazy val bucket = Configuration.aws.bucket
  lazy val stage = if (Play.isTest) "TEST" else Configuration.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"

  def getLivePressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/pressed.json"

  def getDraftPressedKeyForPath(path: String): String =
    s"$location/pressed/draft/$path/pressed.json"

  def getLiveFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/fapi/pressed.json"

  def getDraftFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/draft/$path/fapi/pressed.json"

  def getSchema = get(s"$location/schema.json")
  def getMasterConfig: Option[String] = get(s"$location/config/config.json")
  def getBlock(id: String) = get(s"$location/collection/$id/collection.json")
  def listConfigsIds: List[String] = getConfigIds(s"$location/config/")
  def listCollectionIds: List[String] = getCollectionIds(s"$location/collection/")
  def putCollectionJson(id: String, json: String) = {
    val putLocation: String = s"$location/collection/$id/collection.json"
    putPublic(putLocation, json, "application/json")}

  def archive(id: String, json: String, identity: User) = {
    val now = DateTime.now
    putPrivate(s"$location/history/collection/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/$id/${now}.${identity.email}.json", json, "application/json")
  }

  def putMasterConfig(json: String) =
    putPublic(s"$location/config/config.json", json, "application/json")

  def archiveMasterConfig(json: String, identity: User) = {
    val now = DateTime.now
    putPublic(s"$location/history/config/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/${now}.${identity.email}.json", json, "application/json")
  }

  private def getListing(prefix: String, dropText: String): List[String] = {
    import scala.collection.JavaConversions._
    val summaries = client.map(_.listObjects(bucket, prefix).getObjectSummaries.toList).getOrElse(Nil)
    summaries
      .map(_.getKey.split(prefix))
      .filter(_.nonEmpty)
      .map(_.last)
      .filterNot(_.endsWith("/"))
      .map(_.split(dropText).head)
  }

  def getConfigIds(prefix: String): List[String] = getListing(prefix, "/config.json")
  def getCollectionIds(prefix: String): List[String] = getListing(prefix, "/collection.json")

  def getPressedLastModified(path: String): Option[String] =
    getLastModified(getLiveFapiPressedKeyForPath(path)).map(_.toString)
}
