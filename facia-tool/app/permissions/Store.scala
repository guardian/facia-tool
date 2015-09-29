package permissions

import akka.agent.Agent
import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.{GetObjectRequest, S3Object}
import java.util.Date
import com.gu.pandomainauth.model.User
import conf.{Configuration, aws}
import dispatch.Http
import org.joda.time.DateTime
import org.quartz._
import org.quartz.impl.StdSchedulerFactory
import permissions.ScheduledJob.FunctionJob
import play.api.Logger
import play.api.libs.json._

import scala.collection.mutable
import scala.concurrent.{Future, ExecutionContext}
import scala.io.Source
import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.{Logger => PlayLogger, LoggerLike}

import scala.util.control.NonFatal


class ScheduledJob(callback: Try[Map[String, String]] => Unit = _ => (), scheduler:Scheduler = StdSchedulerFactory.getDefaultScheduler()) {

  private val job = JobBuilder.newJob(classOf[FunctionJob])
                    .withIdentity(s"refresh")
                    .build

  def start(intervalInSeconds: Int = 60) = {
    //kick off the scheduler
    val schedule = SimpleScheduleBuilder.simpleSchedule
      .withIntervalInSeconds(intervalInSeconds)
      .repeatForever()

    val trigger = TriggerBuilder.newTrigger()
      .withSchedule(schedule)
      .build

    ScheduledJob.jobs.put(job.getKey,() => refresh())

    if (scheduler.checkExists(job.getKey)) {
      scheduler.deleteJob(job.getKey)
    }

    scheduler.scheduleJob(job, trigger)
    scheduler.start()
  }

  def refresh() = {
    PermissionsReader.populateCache() match {
      case Right(_) => Logger.info("successfully updated permissions cache")
      case Left(error) => Logger.error("error updating permissions cache " + error)
    }
  }
}

object ScheduledJob {
  // globally accessible state for the scheduler
  private val jobs = mutable.Map[JobKey, () => Unit]()
  class FunctionJob extends Job {
    def execute(context: JobExecutionContext) {
      val f = jobs(context.getJobDetail.getKey)
      f()
    }
  }
}

case class SimplePermission(name: String, app: String, defaultValue: Boolean = true)

object SimplePermission {
  implicit val json = Json.format[SimplePermission]
  val ManageUsers = SimplePermission("manage_users", App.global, defaultValue=false)
  val ConfigureFronts = SimplePermission("configure_fronts", App.fronts, defaultValue=false)
  val all = List(ManageUsers, ConfigureFronts)
}

object App {
  val fronts = "fronts"
  val global = "global"
}

case class PermissionOverrideForUser(userId: String, active: Boolean)

object PermissionOverrideForUser {
  implicit val json = Json.format[PermissionOverrideForUser]
}

case class PermissionCacheEntry(permission: SimplePermission, overrides: List[PermissionOverrideForUser])
object PermissionCacheEntry {
  implicit val jsonFormats = Json.format[PermissionCacheEntry]
}

object PermissionsReader  {

  val s3Client = new AmazonS3Client(aws.mandatoryCredentials)
  s3Client.configureRegion(Regions.fromName("eu-west-1"))
  val bucket = Configuration.faciatool.permissionsCache
  val key = "permissions.json"

  private val agent = Agent[List[PermissionCacheEntry]](List[PermissionCacheEntry]())

  private def getObject(key: String, bucketName: String): Either[PermissionsReaderError, S3Object] = {
    try {
      Right(s3Client.getObject(new GetObjectRequest(bucketName, key)))
    } catch {
      case NonFatal(e) => Left(ErrorLevel("error reading the s3 cache", Some(e)))
    }
  }
  // Get object contents and ensure stream is closed
  //to do - move the parsing and storing somewhere
  private def getObjectContents(obj: S3Object): Either[PermissionsReaderError, PermissionsData] = {
    try {
      val contents = Source.fromInputStream(obj.getObjectContent, "UTF-8").mkString
      val lastMod  = obj.getObjectMetadata.getLastModified
      Right(PermissionsData(contents, lastMod))
    } catch {
      case NonFatal(e)=> Left(ErrorLevel("error reading the S3 cache", Some(e)))
    } finally {
      obj.close()
    }
  }

  def parseS3data(contents: String): Either[PermissionsReaderError, List[PermissionCacheEntry]] = {
    Json.parse(contents).validate[List[PermissionCacheEntry]].fold(error =>
       Left(ErrorLevel(s"error processing data ${error}", None)),
       Right(_)
    )
  }

  private def storePermissionsData(permissions: List[PermissionCacheEntry]) = {
    agent.send(permissions)
  }

  def populateCache(): Either[PermissionsReaderError, Unit] = {
    for {
      obj <- getObject(key, bucket).right
      data <- getObjectContents(obj).right
      permissions <- parseS3data(data.contents).right
      _ <- Right(storePermissionsData(permissions)).right
    } yield ()
  }

  def checkCacheIsPopulated(p: SimplePermission, cache: List[PermissionCacheEntry]): Either[PermissionDefault, List[PermissionCacheEntry]] = {
    if(cache.nonEmpty) Right(cache)
    else Left(PermissionDefault(p.defaultValue, ErrorLevel("Permissions cache not populated, using default value")))
  }

  def getPermission(p: SimplePermission, cache: List[PermissionCacheEntry]): Either[PermissionDefault, PermissionCacheEntry] = {
    cache.find(_.permission==p).map(
      Right(_)
    ).getOrElse(Left(PermissionDefault(p.defaultValue, ErrorLevel(s"Could not find permission ${p.name}}"))))
  }

  def getOverridesForPerm(p: PermissionCacheEntry, user: User): PermissionAuth = {
    p.overrides.find(_.userId==user.email).fold(
      PermissionAuth(p.permission.defaultValue, InfoLevel(s"no override set for permission ${p.permission.name}, using default from service"))
    )(user => PermissionAuth(user.active, InfoLevel(s"user override set to ${user.active} for permission ${p.permission.name}")))
  }

  def readCache(p: SimplePermission, user: User, cache: List[PermissionCacheEntry]): Either[PermissionDefault, PermissionAuth] = {
    for {
      perms <- checkCacheIsPopulated(p, cache).right
      cacheEntry <- getPermission(p, perms).right
      auth <- Right(getOverridesForPerm(cacheEntry, user)).right
    } yield auth
  }

  def get(p: SimplePermission, user: User): Future[Boolean] = {
    agent.future().map { cache =>
      readCache(p, user, cache) match {
        case Left(perm) => {
          Logger.error(perm.logMessage.message)
          perm.active
        }
        case Right(auth) => {
          Logger.info(auth.logMessage.message)
          auth.active
        }
      }
    }
  }
}

sealed trait PermissionsReaderError

case class InfoLevel(message: String, ex: Option[Throwable]=None) extends PermissionsReaderError
case class ErrorLevel(message: String, ex: Option[Throwable]=None) extends PermissionsReaderError

case class PermissionsData(contents: String, lastMod: Date)

case class PermissionAuth(active: Boolean, logMessage: InfoLevel)
case class PermissionDefault(active: Boolean, logMessage: ErrorLevel)



