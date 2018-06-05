package logging

import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.classic.{LoggerContext, Logger => LogbackLogger}
import com.amazonaws.auth.STSAssumeRoleSessionCredentialsProvider
import com.gu.logback.appender.kinesis.KinesisAppender
import conf.ApplicationConfiguration
import net.logstash.logback.layout.LogstashLayout
import org.slf4j.{LoggerFactory, Logger => SLFLogger}

object LogStash extends Logging {
  private val rootLogger = LoggerFactory.getLogger(SLFLogger.ROOT_LOGGER_NAME).asInstanceOf[LogbackLogger]

 class KinesisAppenderConfig(
     stream: String,
     region: String,
     roleArn: String,
     sessionName: String,
     bufferSize: Int
  )

  def makeCustomFields(customFields: Map[String, String]): String = {
    "{" + (for((k, v) <- customFields) yield(s""""${k}":"${v}"""")).mkString(",") + "}"
  }

  def makeLayout(customFields: String) = {
    val l = new LogstashLayout()
    l.setCustomFields(customFields)
    l
  }

  def makeKinesisAppender(layout: LogstashLayout, context: LoggerContext, appenderConfig: KinesisAppenderConfig) = {
    val a = new KinesisAppender[ILoggingEvent]()
    a.setStreamName(appenderConfig.stream)
    a.setRegion(appenderConfig.region)
    a.setCredentialsProvider(new STSAssumeRoleSessionCredentialsProvider.Builder(
      appenderConfig.roleArn, appenderConfig.sessionName
    ).build())
    a.setBufferSize(appenderConfig.bufferSize)

    a.setContext(context)
    a.setLayout(layout)

    layout.start()
    a.start()
    a
  }

  def init(config: ApplicationConfiguration) = {
    if(config.logging.enabled) {
      logger.info("LogConfig initializing")
      val context = rootLogger.getLoggerContext
      val customFields = Map(
        "stack" -> "cms-fronts",
        "stage" -> config.environment.stage.toUpperCase,
        "app"   -> config.environment.applicationName
      )
      val layout = makeLayout(makeCustomFields(customFields))
      val bufferSize = 1000
      // remove the default configuration
      val appender  = makeKinesisAppender(layout, context,
        KinesisAppenderConfig(
          config.logging.stream,
          config.logging.streamRegion,
          config.logging.streamRole,
          config.environment.applicationName,
          bufferSize
        ))

      rootLogger.addAppender(appender)
      logger.info("Configured Logback")
    } else {
      logger.info("Logging disabled")
    }
  }
}
