package common

import java.io.{File, FileInputStream}

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.gu.conf.ConfigurationFactory
import conf.Configuration
import org.apache.commons.io.IOUtils
import play.api.Play.current
import play.api.{Configuration => PlayConfiguration, Play}

import scala.util.Try

class BadConfigurationException(msg: String) extends RuntimeException(msg)

class GuardianConfiguration(val application: String, val webappConfDirectory: String = "env") extends Logging {

  case class OAuthCredentials(oauthClientId: String, oauthSecret: String, oauthCallback: String)

  protected val configuration = ConfigurationFactory.getConfiguration(application, webappConfDirectory)

  protected val playConfiguration = play.api.Play.configuration

  private val installVars = new File("/etc/gu/facia-tool.properties") match {
    case f if f.exists => IOUtils.toString(new FileInputStream(f))
    case _ => ""
  }

  private val properties = Properties(installVars)
  private val stageFromProperties = properties.getOrElse("STAGE", "CODE")
  private val stsRoleToAssumeFromProperties = properties.getOrElse("STS_ROLE", "unknown")

  private implicit class OptionalString2MandatoryWithStage(conf: PlayConfiguration) {
    def getStringFromStage(property: String) =
      playConfiguration.getString(stageFromProperties + "." + property)
        .orElse(playConfiguration.getString(property))
    def getMandatoryStringFromStage(property: String) =
      playConfiguration.getString(stageFromProperties + "." + property)
        .orElse(playConfiguration.getString(property))
        .getOrElse(throw new BadConfigurationException(s"$property not configured for stage " + stageFromProperties))
  }

  object environment {
    val stage = properties.getOrElse("STAGE", "unknown").toLowerCase

    lazy val projectName = Play.application.configuration.getString("guardian.projectName").getOrElse("frontend")
    lazy val secure = Play.application.configuration.getBoolean("guardian.secure").getOrElse(false)

    lazy val isProd = stage == "prod"
    lazy val isNonProd = List("dev", "code", "gudev").contains(stage.toLowerCase)

    lazy val isPreview = projectName == "preview"
  }

  override def toString = configuration.toString

  case class Auth(user: String, password: String)

  object contentApi {
    val contentApiLiveHost: String = playConfiguration.getMandatoryStringFromStage("content.api.host")

    def contentApiDraftHost: String = playConfiguration.getMandatoryStringFromStage("content.api.draft.host")

    lazy val key: Option[String] = playConfiguration.getStringFromStage("content.api.key")
    lazy val timeout: Int = playConfiguration.getInt("content.api.timeout.millis").getOrElse(2000)

    lazy val previewAuth: Option[Auth] = for {
      user <- playConfiguration.getStringFromStage("content.api.preview.user")
      password <- playConfiguration.getStringFromStage("content.api.preview.password")
    } yield Auth(user, password)
  }

  object ophanApi {
    lazy val key = playConfiguration.getStringFromStage("ophan.api.key")
    lazy val host = playConfiguration.getStringFromStage("ophan.api.host")
  }

  object site {
    lazy val host = configuration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object ajax {
    lazy val url = configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val nonSecureUrl =
      configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = configuration.getStringProperty("ajax.cors.origin").map(_.split(",")
      .map(_.trim).toSeq).getOrElse(Nil)
  }

  object facia {
    lazy val stage = playConfiguration.getString("facia.stage").getOrElse(Configuration.environment.stage)
    lazy val collectionCap: Int = 35
  }

  object faciatool {
    lazy val frontPressToolQueue = playConfiguration.getStringFromStage("frontpress.sqs.tool_queue_url")

    lazy val pandomainHost = playConfiguration.getMandatoryStringFromStage("faciatool.pandomain.host")
    lazy val pandomainDomain = playConfiguration.getMandatoryStringFromStage("faciatool.pandomain.domain")
    lazy val pandomainService = playConfiguration.getMandatoryStringFromStage("faciatool.pandomain.service")

    lazy val logStream = playConfiguration.getMandatoryStringFromStage("logging.kinesis.stream")
    lazy val logStreamRegion = playConfiguration.getMandatoryStringFromStage("logging.kinesis.region")
    lazy val logStreamRole = playConfiguration.getMandatoryStringFromStage("logging.kinesis.roleArn")
    lazy val logApp = playConfiguration.getMandatoryStringFromStage("logging.fields.app")
    lazy val logEnabled = playConfiguration.getBoolean("logging.enabled").getOrElse(false)

    lazy val permissionsCache = playConfiguration.getMandatoryStringFromStage("permissions.cache")

    lazy val configBeforePressTimeout: Int = 1000

    val showTestContainers =
      playConfiguration.getStringFromStage("faciatool.show_test_containers").contains("true")

    lazy val adminPressJobStandardPushRateInMinutes: Int =
      Try(playConfiguration.getStringFromStage("admin.pressjob.standard.push.rate.inminutes").get.toInt)
        .getOrElse(5)

    lazy val adminPressJobHighPushRateInMinutes: Int =
      Try(playConfiguration.getStringFromStage("admin.pressjob.high.push.rate.inminutes").get.toInt)
        .getOrElse(1)

    lazy val adminPressJobLowPushRateInMinutes: Int =
      Try(playConfiguration.getStringFromStage("admin.pressjob.low.push.rate.inminutes").get.toInt)
        .getOrElse(60)

    lazy val faciaToolUpdatesStream: Option[String] = playConfiguration.getStringFromStage("faciatool.updates.stream")

    lazy val sentryPublicDSN = playConfiguration.getStringFromStage("faciatool.sentryPublicDSN")

    val stsRoleToAssume = playConfiguration.getStringFromStage("faciatool.sts.role.to.assume").getOrElse(stsRoleToAssumeFromProperties)
  }

  object media {
    lazy val baseUrl = playConfiguration.getStringFromStage("media.base.url")
    lazy val apiUrl = playConfiguration.getStringFromStage("media.api.url")
    lazy val key = playConfiguration.getStringFromStage("media.key")
  }

  object switchBoard {
    val bucket = playConfiguration.getMandatoryStringFromStage("switchboard.bucket")
    val objectKey = playConfiguration.getMandatoryStringFromStage("switchboard.object")
  }

  object aws {
    lazy val region = playConfiguration.getMandatoryStringFromStage("aws.region")
    lazy val bucket = playConfiguration.getMandatoryStringFromStage("aws.bucket")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").dequote.trim
}
