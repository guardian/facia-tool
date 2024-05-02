package services.editions.publishing
import com.amazonaws.services.sns.AmazonSNS
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest}
import conf.ApplicationConfiguration
import model.FeastAppModel.{ContainerItem, FeastAppContainer, FeastAppCuration, Recipe, RecipeIdentifier}
import model.editions.{PublishableIssue, PublishedArticle, PublishedCollection}
import play.api.libs.json.{Json, Writes}
import util.TimestampGenerator
import scala.jdk.CollectionConverters._

object FeastPublicationTarget {
  object MessageType extends Enumeration {
    val Issue, EditionsList = Value
  }
  type MessageType = MessageType.Value
}

class FeastPublicationTarget(snsClient:AmazonSNS, config: ApplicationConfiguration, timestamp:TimestampGenerator) extends PublicationTarget {
  private def transformArticles(source:PublishedArticle):ContainerItem = {
    //FIXME: This is a hack, since we can't actually generate any of the content types that Feast wants yet!
    Recipe(recipe = RecipeIdentifier(source.internalPageCode.toString))
  }

  private val findSpace = "\\s+".r

  /**
   * Feast app expects a name like `all-recipes` wheras we have `All Recipes`
   * @param originalName name to transform
   * @return name in kebab-case
   */
  private def transformName(originalName:String):String = findSpace.replaceAllIn(originalName.toLowerCase, "-")

  private def transformCollections(collection:PublishedCollection):FeastAppContainer =
    FeastAppContainer(
      id=collection.id,
      title=collection.name,
      body=Some(""),  //TBD, this is just how it appears in the data at the moment
      items = collection.items.map(transformArticles)
    )

  def transformContent(source: PublishableIssue): FeastAppCuration = {
    source.fronts.map(f=>{
      (transformName(f.name), f.collections.map(transformCollections).toIndexedSeq)
    })
  }.toMap

  override def putIssue(issue: PublishableIssue, key: Option[String]=None): Unit = {
    val outputKey = key.getOrElse(EditionsBucket.createKey(issue))
    putIssueJson(transformContent(issue), outputKey)
  }

  private def createPublishRequest(content:String, messageType:FeastPublicationTarget.MessageType):PublishRequest = {
    new PublishRequest()
      .withMessage(content)
      .withTopicArn(config.aws.feastAppPublicationTopic)
      .withMessageAttributes(Map(
        "timestamp"->new MessageAttributeValue().withDataType("Number").withStringValue(timestamp.getTimestamp.toString),
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
