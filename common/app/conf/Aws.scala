package conf

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import common.BadConfigurationException
import play.api.{Logger, Play}
import play.api.Play.current
import java.util.UUID

object aws {
  def mandatoryCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
  val roleToAssumeArn ="arn:aws:iam::642631414762:role/CmsFrontsRole-FaciaToolRole-1U44IWRZDIWAX"

  val credentials: Option[AWSCredentialsProvider] = {
    val sessionId = UUID.randomUUID().toString()
    val provider = new AWSCredentialsProviderChain(
      new ProfileCredentialsProvider("CMS Fronts"),
      new STSAssumeRoleSessionCredentialsProvider(roleToAssumeArn, sessionId),
      new InstanceProfileCredentialsProvider
    )

    // this is a bit of a convoluted way to check whether we actually have credentials.
    // I guess in an ideal world there would be some sort of isConfigued() method...
    try {
      val creds = provider.getCredentials
      Logger.info("**** " + creds)
      Some(provider)
    } catch {
      case ex: AmazonClientException =>
        Logger.error("amazon client exception")

        // We really, really want to ensure that PROD is configured before saying a box is OK
        if (Play.isProd) throw ex
        // this means that on dev machines you only need to configure keys if you are actually going to use them
        None
    }
  }

}
