package common

import java.util.TimeZone

import org.quartz._
import org.quartz.impl.StdSchedulerFactory
import play.api.Play
import play.api.Play.current

import scala.collection.mutable

object Jobs extends Logging {
  private val scheduler = StdSchedulerFactory.getDefaultScheduler()
  private val jobs = mutable.Map[String, () => Unit]()

  class FunctionJob extends Job {
    def execute(context: JobExecutionContext) {
      val f = jobs(context.getJobDetail.getKey.getName)
      f()
    }
  }

  scheduler.start()

  def schedule(name: String, cron: String)(block: => Unit): Unit = {
    schedule(name, CronScheduleBuilder.cronSchedule(new CronExpression(cron)))(block)
  }

  def schedule(name: String, cron: String, timeZone: TimeZone)(block: => Unit): Unit = {
    schedule(name,
      CronScheduleBuilder.cronSchedule(new CronExpression(cron)).inTimeZone(timeZone))(block)
  }

  def schedule(name: String, schedule: => CronScheduleBuilder)(block: => Unit): Unit = {
    // running cron scheduled jobs in tests is useless
    // it just results in unexpected data files when you
    // want to check in
    if (!Play.isTest) {
      log.info(s"Scheduling $name")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build()
      )
    }
  }

  def scheduleEveryNMinutes(name: String, intervalInMinutes: Int)(block: => Unit): Unit = {
    if (!Play.isTest) {
      val schedule = DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule().withIntervalInMinutes(intervalInMinutes)
      log.info(s"Scheduling $name to run every $intervalInMinutes minutes")
      jobs.put(name, () => block)

      scheduler.scheduleJob(
        JobBuilder.newJob(classOf[FunctionJob]).withIdentity(name).build(),
        TriggerBuilder.newTrigger().withSchedule(schedule).build()
      )
    }
  }

  def deschedule(name: String) {
    log.info(s"Descheduling $name")
    jobs.remove(name)
    scheduler.deleteJob(new JobKey(name))
  }
}
