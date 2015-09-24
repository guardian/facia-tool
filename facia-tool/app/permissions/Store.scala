package permissions

import akka.agent.Agent
import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.{GetObjectRequest, S3Object}
import java.util.Date
import com.gu.pandomainauth.model.User
import conf.aws
import dispatch.Http
import org.quartz._
import org.quartz.impl.StdSchedulerFactory
import permissions.ScheduledJob.FunctionJob
import play.api.libs.json._

import scala.collection.mutable
import scala.concurrent.{Future, ExecutionContext}
import scala.io.Source
import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global


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
    println("CALLING REFRESH")
    val s3Client = new AmazonS3Client(aws.permissionsCreds)
    s3Client.setRegion(Regions.fromName("eu-west-1"))
    val permissionsReader = new PermissionsReader("permissions.json", "permissions-cache/CODE", s3Client)
    permissionsReader.storePermissions("permissions.json", "permissions-cache/CODE")
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

class PermissionsReader(key: String, bucket: String, s3Client: AmazonS3Client)  {

  private val agent = Agent[List[PermissionCacheEntry]](List[PermissionCacheEntry]())

  private def getObject(key: String, bucketName: String): S3Object = s3Client.getObject(new GetObjectRequest(bucketName, key))
  // Get object contents and ensure stream is closed
  //to do - move the parsing and storing somewhere
  def storePermissions(key: String, bucketName: String): (String, Date) = {
    val obj = getObject(key, bucketName)
    try {
      val (contents, date) = (Source.fromInputStream(obj.getObjectContent, "UTF-8").mkString, obj.getObjectMetadata.getLastModified)
      val jsValue = Json.parse(contents)
      val permissionCache = jsValue.validate[List[PermissionCacheEntry]]
      permissionCache match {
        case JsSuccess(perm, _) => {
          println("STORING PERMS " + perm)
          agent.alter(_ => perm)
        }
        case JsError(error) => println(s"could not format ${error}")
      }
      (contents, date)
    } catch {
      case e: Exception => {
        ("Contents", new Date)
      }
    } finally {
      obj.close()
    }
  }

  def get(p: SimplePermission, user: User): Future[Boolean] = {
    println("****************** CHECKING THE PERM *************")
    val psFt = agent.future()
    psFt.map { ps =>
      println("ARE THERE ANY PERMS " + ps)
      val permission = ps.find(_.permission==p)
      permission match {
        case Some(tmp) => {
          val overrides = tmp.overrides
          val users = overrides.find(_.userId==user.email)
          users match {
            case Some(u) => {
              println(s"permission override for ${u.active}")
              u.active
            }
            case None => {
              println("no overrides for user")
              p.defaultValue
            }
          }
        }
        case None => {
          println("defaulting default")
          p.defaultValue
        }
      }
    }

  }
}





