package conf

import java.io.{File, FileInputStream}

import common.Properties
import org.apache.commons.io.IOUtils
import play.api.Play.current
import play.api.{Configuration => PlayConfiguration, Logger}

import scala.io.Source

class BadConfigurationException(msg: String) extends RuntimeException(msg)

object Configuration {
  private val playConfiguration: PlayConfiguration = play.api.Play.configuration

  private val propertiesFile = "/etc/gu/facia-tool.properties"
  private val installVars = new File(propertiesFile) match {
    case f if f.exists => IOUtils.toString(new FileInputStream(f))
    case _ =>
      Logger.warn("Missing configuration file $propertiesFile")
      ""
  }

  private val properties = Properties(installVars)
  private val stageFromProperties = properties.getOrElse("STAGE", "CODE")
  private val projectFromProperties = properties.getOrElse("PROJECT", "facia-tool")
  private val stsRoleToAssumeFromProperties = properties.getOrElse("STS_ROLE", "unknown")

  private def getString(property: String): Option[String] =
    playConfiguration.getString(projectFromProperties + "." + stageFromProperties + "." + property)
      .orElse(playConfiguration.getString(projectFromProperties + "." + property))
      .orElse(playConfiguration.getString(stageFromProperties + "." + property))
      .orElse(playConfiguration.getString(property))

  private def getMandatoryString(property: String): String = getString(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type string not configured for stage $stageFromProperties and project $projectFromProperties"))

  private def getBoolean(property: String): Option[Boolean] =
    playConfiguration.getBoolean(projectFromProperties + "." + stageFromProperties + "." + property)
      .orElse(playConfiguration.getBoolean(projectFromProperties + "." + property))
      .orElse(playConfiguration.getBoolean(stageFromProperties + "." + property))
      .orElse(playConfiguration.getBoolean(property))

  private def getMandatoryBoolean(property: String): Boolean = getBoolean(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type boolean not configured for stage $stageFromProperties and project $projectFromProperties"))



  object environment {
    val stage = stageFromProperties.toLowerCase
    lazy val project: String = projectFromProperties
  }

  object contentApi {
    case class Auth(user: String, password: String)

    val contentApiLiveHost: String = getMandatoryString("content.api.host")
    def contentApiDraftHost: String = getMandatoryString("content.api.draft.host")

    lazy val key: Option[String] = getString("content.api.key")
    lazy val timeout: Int = 2000

    lazy val previewAuth: Option[Auth] = for {
      user <- getString("content.api.preview.user")
      password <- getString("content.api.preview.password")
    } yield Auth(user, password)
  }

  object ophanApi {
    lazy val key = getString("ophan.api.key")
    lazy val host = getString("ophan.api.host")
  }

  object ajax {
    lazy val corsOrigins: Seq[String] = getString("ajax.cors.origin").map(_.split(",")
    .map(_.trim).toSeq).getOrElse(Nil)
  }

  object aws {
    lazy val region = getMandatoryString("aws.region")
    lazy val bucket = getMandatoryString("aws.bucket")
    lazy val crossAccount = getMandatoryBoolean("aws.crossAccount")
  }

  object facia {
    lazy val stage = getString("facia.stage").getOrElse(stageFromProperties)
    lazy val collectionCap: Int = 35
  }

  object logging {
    lazy val stream = getMandatoryString("logging.kinesis.stream")
    lazy val streamRegion = getMandatoryString("logging.kinesis.region")
    lazy val streamRole = getMandatoryString("logging.kinesis.roleArn")
    lazy val app = getMandatoryString("logging.fields.app")
    lazy val enabled = getBoolean("logging.enabled").getOrElse(false)
  }

  object faciatool {
    lazy val frontPressToolQueue = getString("frontpress.sqs.tool_queue_url")
    lazy val showTestContainers = getBoolean("faciatool.show_test_containers").getOrElse(false)
    lazy val faciaToolUpdatesStream: Option[String] = getString("faciatool.updates.stream")
    lazy val stsRoleToAssume = getString("faciatool.sts.role.to.assume").getOrElse(stsRoleToAssumeFromProperties)
  }

  object media {
    lazy val baseUrl = getString("media.base.url")
    lazy val apiUrl = getString("media.api.url")
    lazy val key = getString("media.key")
  }

  object pandomain {
    lazy val host = getMandatoryString("pandomain.host")
    lazy val domain = getMandatoryString("pandomain.domain")
    lazy val service = getMandatoryString("pandomain.service")
    lazy val roleArn = getMandatoryString("pandomain.roleArn")
  }

  object permission {
    lazy val cache = getMandatoryString("permissions.cache")
  }

  object sentry {
    lazy val publicDSN = getString("sentry.publicDSN").getOrElse("")
  }

  object switchBoard {
    val bucket = getMandatoryString("switchboard.bucket")
    val objectKey = getMandatoryString("switchboard.object")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").replace("\"", "").trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").replace("\"", "").trim
}

object ManifestFile {
  lazy val asStringOpt =
    Option(getClass.getResourceAsStream("/version.txt")) map (Source.fromInputStream(_).mkString)
  lazy val asString = asStringOpt getOrElse ""
  lazy val asList = asStringOpt map { _.split("\n").toList } getOrElse Nil
  lazy val asKeyValuePairs = (asList map { _.split(":") } collect { case Array(k, v) => k -> v }).toMap
}
