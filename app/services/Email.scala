package services

import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder
import com.amazonaws.services.simpleemail.model._
import conf.ApplicationConfiguration

import collection.JavaConverters._
import scala.util.Try

class Email(val config: ApplicationConfiguration) {
  private val emailClient = AmazonSimpleEmailServiceClientBuilder.standard
    .withRegion(config.aws.region)
    .build

  private val from = "noreply-viewer@guardian.co.uk"

  def sendEmail(to: String, subject: String, body: String): Try[SendEmailResult] = {
    val message = new Message(
      new Content(subject),
      new Body(new Content(body))
    )

    val request = new SendEmailRequest(
      from,
      new Destination(Seq(to).asJava),
      message
    )

    Try(emailClient.sendEmail(request))
  }
}
