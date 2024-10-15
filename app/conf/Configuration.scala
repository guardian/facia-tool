package conf

import java.io.{File, FileInputStream, InputStream}
import java.net.URL
import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import org.apache.commons.io.IOUtils
import play.api.{Configuration => PlayConfiguration}
import logging.Logging

import scala.jdk.CollectionConverters._
import scala.language.reflectiveCalls
import com.amazonaws.services.rds.model.DescribeDBInstancesRequest
import com.amazonaws.services.rds.AmazonRDSClientBuilder
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder
import com.amazonaws.services.simplesystemsmanagement.model.GetParameterRequest
import software.amazon.awssdk.auth.credentials.{DefaultCredentialsProvider, AwsCredentialsProviderChain => NewAwsCredentialsProviderChain, ProfileCredentialsProvider => NewProfileCredentialsProvider}

import java.nio.charset.StandardCharsets

class BadConfigurationException(msg: String) extends RuntimeException(msg)

class ApplicationConfiguration(
                                val playConfiguration: PlayConfiguration,
                                val isProd: Boolean,
                                // Override properties defined in configuration. Useful for testing.
                                val propertyOverrides: Map[String, String] = Map.empty
                              ) extends Logging  {
  private val propertiesFile = "/etc/gu/facia-tool.properties"
  private val installVars = new File(propertiesFile) match {
    case f if f.exists => IOUtils.toString(new FileInputStream(f), "UTF-8")
    case _ =>
      logger.warn("Missing configuration file $propertiesFile")
      ""
  }

  private val properties = Properties(installVars) ++ propertyOverrides
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

    // isProd is derived from the environment mode which is given
    // to us by play, it is true for both prod and code. Stage is a variable coming
    // from the config and tells us which bucket we are reading fronts and collections from.
    // Stage is prod for production environment and code for code and dev environemnts.
    // These two variables together allow us to determine the application url.
    val correspondingToolsDomainSuffix = if (isProd && stage == "code") "code.dev-gutools.co.uk"
      else if (isProd) "gutools.co.uk"
      else "local.dev-gutools.co.uk"

    val applicationUrl = s"https://fronts.${correspondingToolsDomainSuffix}"
  }

  object ophanApi {
    lazy val key = getString("ophan.api.key")
    lazy val host = getString("ophan.api.host")
  }

  object recipesApi {
    lazy val key = getString("recipes.api.key")
    lazy val url = getString("recipes.api.url")
  }

  object analytics {
    lazy val secret = getMandatoryString("analytics.secret")
  }

  object aws {
    lazy val region = getMandatoryString("aws.region")
    lazy val bucket = getMandatoryString("aws.bucket")
    lazy val frontsBucket = getMandatoryString("aws.frontsBucket")
    lazy val publishedEditionsIssuesBucket = getMandatoryString("aws.publishedEditionsIssuesBucket")
    lazy val previewEditionsIssuesBucket = getMandatoryString("aws.previewEditionsIssuesBucket")

    lazy val feastAppPublicationTopic = getMandatoryString("feast_app.publication_topic")

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
    // NB this does not fail with exception (as the 'old' credentials above).  It is assumed that the code
    // above would have already failed.
    // If and when this code is rewritten to remove the 'old' approach, then that behaviour may be duplicated here.
    def newStyleCmsFrontsAccountCredentials = NewAwsCredentialsProviderChain
      .builder()
      .addCredentialsProvider(NewProfileCredentialsProvider.create("cmsFronts"))
      .addCredentialsProvider(DefaultCredentialsProvider.create())
      .build()

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
    lazy val rdsClient = AmazonRDSClientBuilder.standard().withCredentials(cmsFrontsAccountCredentials).withRegion(region).build()
    lazy val ssmClient = AWSSimpleSystemsManagementClientBuilder.standard().withCredentials(cmsFrontsAccountCredentials).withRegion(region).build()
    lazy val s3Client = AmazonS3ClientBuilder.standard().withCredentials(cmsFrontsAccountCredentials).withRegion(region).build()
  }

  object postgres {
    val (hostname, port) = findRDSEndpointAndPort()
    val url = s"jdbc:postgresql://$hostname:$port/faciatool"
    val user =  "faciatool"
    val password = getPassword

    private def getPassword: String = {
      // In fronts tool 'isProd' means is CODE or PROD because fuck it why not
      if (isProd) {
          val request = new GetParameterRequest()
            .withName(s"/facia-tool/cms-fronts/$stageFromProperties/db/password")
            .withWithDecryption(true)

          val response = aws.ssmClient.getParameter(request)
          response.getParameter.getValue
      } else {
        getMandatoryString("db.default.password")
      }
    }

    private def findRDSEndpointAndPort(): (String, String) = {
      // In fronts tool 'isProd' means is CODE or PROD because fuck it why not
      if (isProd) {
        val dbIdentifier = if (stageFromProperties == "PROD") "facia-prod-db" else "facia-code-db"
        val request = new DescribeDBInstancesRequest().withDBInstanceIdentifier(dbIdentifier)
        val instances = aws.rdsClient.describeDBInstances(request).getDBInstances.asScala.toList

        if (instances.length != 1) {
          throw new IllegalStateException(s"Invalid number of RDS instances, expected 1, found ${instances.length}")
        }

        val instance = instances.head
        val awsHost = instance.getEndpoint.getAddress
        val awsPort = instance.getEndpoint.getPort.toString
        (awsHost, awsPort)
      } else {
        val host = getMandatoryString("db.default.hostname")
        val port = getMandatoryString("db.default.port")
        (host, port)
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
        new ProfileCredentialsProvider("cmsFronts"),
        InstanceProfileCredentialsProvider.getInstance()
      )
    }
  }

  object contentApi {
    case class Auth(user: String, password: String)

    val contentApiLiveHost: String = getMandatoryString("content.api.host")
    def contentApiDraftHost: String = getMandatoryString("content.api.draft.iam-host")
    lazy val editionsKey: String = getMandatoryString("content.api.editions.apiKey")

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

  object faciatool {
    lazy val breakingNewsFront = "breaking-news"
    lazy val canEditEditions = "edit-editions"
    lazy val frontPressToolTopic = getString("faciatool.sns.tool_topic_arn")
    lazy val publishEventsQueue = getMandatoryString("publish_events.queue_url")
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
    lazy val bucketName = getMandatoryString("pandomain.bucketName")
    lazy val settingsFileKey = s"$domain.settings"
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
  def withCloseable[T <: { def close():Unit }](closeable: T) = new {
    def apply[S](body: T => S) = try {
      body(closeable)
    } finally {
      closeable.close()
    }
  }
}
