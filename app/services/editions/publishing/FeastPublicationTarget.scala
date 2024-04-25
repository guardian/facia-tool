package services.editions.publishing
import com.amazonaws.services.sns.AmazonSNS
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest}
import conf.ApplicationConfiguration
import model.editions.PublishableIssue
import play.api.Configuration
import play.api.libs.json.{Json, Writes}
import services.editions.publishing.transform.{FeastAppModel, FeastAppTransform}

import java.time.Instant
import scala.jdk.CollectionConverters._

object FeastPublicationTarget {
  object MessageType extends Enumeration {
    val Issue, EditionsList = Value
  }
  type MessageType = MessageType.Value
}

class FeastPublicationTarget(snsClient:AmazonSNS, config: ApplicationConfiguration) extends PublicationTargetWithTransform[FeastAppModel.FeastAppCuration] {
  override val transform: PublicationTransform[FeastAppModel.FeastAppCuration] = FeastAppTransform()

  private def createPublishRequest(content:String, messageType:FeastPublicationTarget.MessageType):PublishRequest = {
    new PublishRequest()
      .withMessage(content)
      .withTopicArn(config.aws.feastAppPublicationTopic)
      .withMessageAttributes(Map(
        "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue(Instant.now().toEpochMilli.toString),
        "type"->new MessageAttributeValue().withDataType("String").withStringValue(messageType.toString),
      ).asJava)
  }

  override def putIssueJson[T:Writes](issue: T, key:String): Unit = {
    val content = Json.stringify(Json.toJson(issue))
    snsClient.publish(createPublishRequest(content, FeastPublicationTarget.MessageType.Issue))
  }

  override def putEditionsList(rawJson: String): Unit = {
    snsClient.publish(createPublishRequest(rawJson, FeastPublicationTarget.MessageType.EditionsList))
  }
}
