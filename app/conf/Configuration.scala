package conf

import java.io.{File, FileInputStream, InputStream}
import java.net.URL

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.services.rds.auth.{GetIamAuthTokenRequest, RdsIamAuthTokenGenerator}
import org.apache.commons.io.IOUtils
import play.api.{Configuration => PlayConfiguration}
import logging.Logging

import scala.collection.JavaConverters._
import scala.language.reflectiveCalls
import com.amazonaws.services.rds.model.{DescribeDBInstancesRequest, Filter => RDSFilter}
import com.amazonaws.services.rds.AmazonRDSClientBuilder

class BadConfigurationException(msg: String) extends RuntimeException(msg)

class ApplicationConfiguration(val playConfiguration: PlayConfiguration, val isProd: Boolean) extends Logging  {
  private val propertiesFile = "/etc/gu/facia-tool.properties"
  private val installVars = new File(propertiesFile) match {
    case f if f.exists => IOUtils.toString(new FileInputStream(f))
    case _ =>
      logger.warn("Missing configuration file $propertiesFile")
      ""
  }

  private val properties = Properties(installVars)
  private val stageFromProperties = properties.getOrElse("STAGE", "CODE")
  private val stsRoleToAssumeFromProperties = properties.getOrElse("STS_ROLE", "unknown")
  private val frontPressedDynamoTable = properties.getOrElse("FRONT_PRESSED_TABLE", "unknown")
  private val userTable = properties.getOrElse("USER_DATA_TABLE", "unknown")

  private def getString(property: String): Option[String] =
    playConfiguration.getOptional[String](stageFromProperties + "." + property)
      .orElse(playConfiguration.getOptional[String](property))

  private def getMandatoryString(property: String): String = getString(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type string not configured for stage $stageFromProperties"))

  private def getBoolean(property: String): Option[Boolean] =
    playConfiguration.getOptional[Boolean](stageFromProperties + "." + property)
      .orElse(playConfiguration.getOptional[Boolean](property))

  private def getMandatoryBoolean(property: String): Boolean = getBoolean(property)
    .getOrElse(throw new BadConfigurationException(s"$property of type boolean not configured for stage $stageFromProperties"))

  def getMandatoryStringPropertiesSplitByComma(propertyName: String): List[String] = {
    getMandatoryString(propertyName).split(",").toList.filter(_.nonEmpty)
  }

  object environment {
    val stage = stageFromProperties.toLowerCase

    val applicationName = "facia-tool"

    // isProd is derived from the enviroment mode which is given
    // to us by play, it is true for both prod and code. Stage is a variable coming
    // from the config and tells us which bucket we are reading fronts and collections from.
    // Stage is prod for production environment and code for code and dev environemnts.
    // These two variables together allow us to determine the application url.
    val applicationUrl = if (isProd && stage == "code") "https://fronts.code.dev-gutools.co.uk"
      else if (isProd) "https://fronts.gutools.co.uk"
      else "https://fronts.local.dev-gutools.co.uk"
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

    def cmsFrontsAccountCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured for CMS Fronts"))
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
          logger.error("amazon client exception")

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (isProd) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }

    def frontendAccountCredentials: AWSCredentialsProvider = crossAccount.getOrElse(throw new BadConfigurationException("AWS credentials are not configured for cross account Frontend"))
    var crossAccount: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("frontend"),
        new STSAssumeRoleSessionCredentialsProvider.Builder(faciatool.stsRoleToAssume, "frontend").build()
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        val creds = provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          logger.error("amazon client cross account exception")

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (isProd) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }
    val rdsClient = AmazonRDSClientBuilder.standard().withCredentials(cmsFrontsAccountCredentials).withRegion(region).build()
  }

  object postgres {
    val hostname = findRDSEndpoint
    val url = s"jdbc:postgres://$hostname:5432/facia-tool"
    val user =  "facia-tool"
    val password = getPassword

    private def getPassword: String = {
      // In fronts tool 'isProd' means is CODE or PROD because fuck it why not
      if (isProd) {
        val generator = RdsIamAuthTokenGenerator.builder().credentials(credentialsProviderChain()).region(aws.region).build()
        generator.getAuthToken(GetIamAuthTokenRequest.builder.hostname(hostname).port(5432).userName(user).build())
      } else {
        getMandatoryString("db.default.password")
      }
    }

    private def findRDSEndpoint(): String = {
      // In fronts tool 'isProd' means is CODE or PROD because fuck it why not
      if (isProd) {
        val request = new DescribeDBInstancesRequest().withFilters(
          new RDSFilter().withName("tag:App").withValues(environment.applicationName),
          new RDSFilter().withName("tag:Stage").withValues(stageFromProperties)
        )

        val instances = aws.rdsClient.describeDBInstances(request).getDBInstances.asScala.toList

        if (instances.length != 1) {
          throw new IllegalStateException(s"Invalid number of RDS instances, expected 1, found ${instances.length}")
        }

        instances.head.getEndpoint.getAddress
      } else {
        getMandatoryString("db.default.hostname")
      }
    }


    def credentialsProviderChain(accessKey: Option[String] = None, secretKey: Option[String] = None): AWSCredentialsProviderChain = {
      new AWSCredentialsProviderChain(
        new AWSCredentialsProvider {
          override def getCredentials: AWSCredentials = (for {
            key <- accessKey
            secret <- secretKey
          } yield new BasicAWSCredentials(key, secret)).orNull

          override def refresh(): Unit = {}
        },
        new EnvironmentVariableCredentialsProvider,
        new SystemPropertiesCredentialsProvider,
        new ProfileCredentialsProvider("facia-tool"),
        InstanceProfileCredentialsProvider.getInstance()
      )
    }
  }


  object cdn {
    lazy val basePath = getString("assets.basePath").getOrElse("/")
  }

  object contentApi {
    case class Auth(user: String, password: String)

    val contentApiLiveHost: String = getMandatoryString("content.api.host")
    def contentApiDraftHost: String = getMandatoryString("content.api.draft.iam-host")

    lazy val key: Option[String] = getString("content.api.key")
    lazy val timeout: Int = 2000

    lazy val previewRole: String = getMandatoryString("content.api.draft.role")

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
    lazy val frontPressUpdateTable = frontPressedDynamoTable
    lazy val userDataTable = userTable
  }

  object media {
    lazy val baseUrl = getString("media.base.url")
    lazy val apiUrl = getMandatoryString("media.api.url")
    lazy val usageUrl = getMandatoryString("media.usage.url")
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
    lazy val userGroups = getMandatoryStringPropertiesSplitByComma("pandomain.user.groups")
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

object Properties extends AutomaticResourceManagement {
  def apply(is: InputStream): Map[String, String] = {
    val properties = new java.util.Properties()
    withCloseable(is) { properties load _ }
    properties.asScala.toMap
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
