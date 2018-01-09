package conf

import java.io.{File, FileInputStream, InputStream}
import java.net.URL

import com.amazonaws.AmazonClientException
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.auth._
import org.apache.commons.io.IOUtils
import play.api.{Configuration => PlayConfiguration, Logger, Play}

import scala.collection.JavaConversions._
import scala.language.reflectiveCalls

class BadConfigurationException(msg: String) extends RuntimeException(msg)

class ApplicationConfiguration(val playConfiguration: PlayConfiguration, val isProd: Boolean) {
  private val propertiesFile = "/etc/gu/facia-tool.properties"
  private val installVars = new File(propertiesFile) match {
    case f if f.exists => IOUtils.toString(new FileInputStream(f))
    case _ =>
      Logger.warn("Missing configuration file $propertiesFile")
      ""
  }

  private val properties = Properties(installVars)
  private val stageFromProperties = properties.getOrElse("STAGE", "CODE")
  private val stsRoleToAssumeFromProperties = properties.getOrElse("STS_ROLE", "unknown")
  private val forntPressedDynamoTable = properties.getOrElse("FRONT_PRESSED_TABLE", "unknown")

  private def getString(property: String): Option[String] =
    playConfiguration.getString(stageFromProperties + "." + property)
      .orElse(playConfiguration.getString(property))

  private def getMandatoryString(property: String): String = getString(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type string not configured for stage $stageFromProperties"))

  private def getBoolean(property: String): Option[Boolean] =
    playConfiguration.getBoolean(stageFromProperties + "." + property)
      .orElse(playConfiguration.getBoolean(property))

  private def getMandatoryBoolean(property: String): Boolean = getBoolean(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type boolean not configured for stage $stageFromProperties"))

  object environment {
    val stage = stageFromProperties.toLowerCase
    val applicationName = "facia-tool"
  }

  object ophanApi {
    lazy val key = getString("ophan.api.key")
    lazy val host = getString("ophan.api.host")
  }

  object analytics {
    lazy val secret = getMandatoryString("analytics.secret")
  }

  object aws {
    lazy val region = getMandatoryString("aws.region")
    lazy val bucket = getMandatoryString("aws.bucket")
    lazy val frontsBucket = getMandatoryString("aws.frontsBucket")

    def mandatoryCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
    val credentials: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("cmsFronts"),
        new DefaultAWSCredentialsProviderChain()
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        val creds = provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          Logger.error("amazon client exception")

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (isProd) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }

    def mandatoryCrossAccountCredentials: AWSCredentialsProvider = crossAccount.getOrElse(throw new BadConfigurationException("AWS credentials are not configured for cross account"))
    var crossAccount: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("frontend"),
        new STSAssumeRoleSessionCredentialsProvider(faciatool.stsRoleToAssume, "frontend")
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        val creds = provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          Logger.error("amazon client cross account exception")

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (isProd) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }
  }

  object cdn {
    lazy val basePath = getString("assets.basePath").getOrElse("/")
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

  object facia {
    lazy val stage = getString("facia.stage").getOrElse(stageFromProperties)
    lazy val collectionCap: Int = 20
    lazy val navListCap: Int = 40
    lazy val navListType: String = "nav/list"
  }

  object logging {
    lazy val stream = getMandatoryString("logging.kinesis.stream")
    lazy val streamRegion = getMandatoryString("logging.kinesis.region")
    lazy val streamRole = getMandatoryString("logging.kinesis.roleArn")
    lazy val app = getMandatoryString("logging.fields.app")
    lazy val enabled = getBoolean("logging.enabled").getOrElse(false)
  }

  object faciatool {
    lazy val breakingNewsFront = "breaking-news"
    lazy val frontPressToolQueue = getString("frontpress.sqs.tool_queue_url")
    lazy val showTestContainers = getBoolean("faciatool.show_test_containers").getOrElse(false)
    lazy val stsRoleToAssume = getString("faciatool.sts.role.to.assume").getOrElse(stsRoleToAssumeFromProperties)
    lazy val frontPressUpdateTable = forntPressedDynamoTable
  }

  object media {
    lazy val baseUrl = getString("media.base.url")
    lazy val apiUrl = getMandatoryString("media.api.url")
    lazy val key = getMandatoryString("media.key")
  }

  object notification {
    lazy val host = getMandatoryString("notification.host")
    lazy val key = getMandatoryString("notification.key")
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

  object auditing {
    lazy val stream: String = getMandatoryString("auditing.stream")
    lazy val maxDataSize: Int = 102400
  }
}

object Properties extends AutomaticResourceManagement {
  def apply(is: InputStream): Map[String, String] = {
    val properties = new java.util.Properties()
    withCloseable(is) { properties load _ }
    properties.toMap
  }

  def apply(text: String): Map[String, String] = apply(IOUtils.toInputStream(text))
  def apply(file: File): Map[String, String] = apply(new FileInputStream(file))
  def apply(url: URL): Map[String, String] = apply(url.openStream)
}

trait AutomaticResourceManagement {
  def withCloseable[T <: { def close() }](closeable: T) = new {
    def apply[S](body: T => S) = try {
      body(closeable)
    } finally {
      closeable.close()
    }
  }
}
