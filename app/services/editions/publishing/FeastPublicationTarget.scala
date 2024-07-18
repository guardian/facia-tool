package services.editions.publishing

import com.amazonaws.services.sns.AmazonSNS
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest}
import conf.ApplicationConfiguration
import model.FeastAppModel.{Chef, ContainerItem, FeastAppContainer, FeastAppCuration, FeastCollection, Palette, Recipe, RecipeIdentifier}
import model.editions.PublishAction.PublishAction
import model.editions.{EditionsArticle, EditionsCard, EditionsChef, EditionsCollection, EditionsFeastCollection, EditionsIssue, EditionsRecipe, PublishableIssue, PublishedArticle, PublishedCollection}
import play.api.libs.json.{Json, Writes}
import util.TimestampGenerator

import scala.jdk.CollectionConverters._

object FeastPublicationTarget {
  object MessageType extends Enumeration {
    val Issue, EditionsList = Value
  }

  type MessageType = MessageType.Value
}

class FeastPublicationTarget(snsClient: AmazonSNS, config: ApplicationConfiguration, timestamp: TimestampGenerator) extends PublicationTarget {
  private def transformArticles(source: EditionsCard): ContainerItem = {
    source match {
      case _: EditionsArticle => throw new Error("Article not permitted in a Feast Front")
      case EditionsRecipe(id, _) => Recipe(RecipeIdentifier(id))
      case EditionsChef(id, addedOn, metadata) => Chef(id = id,
        image = metadata.flatMap(_.chefImageOverride.map(_.src)),
        bio = metadata.flatMap(_.bio),
        backgroundHex = metadata.flatMap(_.palette.map(_.backgroundHex)),
        foregroundHex = metadata.flatMap(_.palette.map(_.foregroundHex)))
      case _:EditionsFeastCollection => FeastCollection(byline=None, darkPalette=None, image=None, body=None, title="", lightPalette=None, recipes=List.empty)
    }
  }

  private val findSpace = "\\s+".r

  /**
   * Feast app expects a name like `all-recipes` wheras we have `All Recipes`
   *
   * @param originalName name to transform
   * @return name in kebab-case
   */
  private def transformName(originalName: String): String = findSpace.replaceAllIn(originalName.toLowerCase, "-")

  private def transformCollections(collection: EditionsCollection): FeastAppContainer =
    FeastAppContainer(
      id = collection.id,
      title = collection.displayName,
      body = Some(""), //TBD, this is just how it appears in the data at the moment
      items = collection.items.map(transformArticles)
    )

  def transformContent(source: EditionsIssue, version: String): FeastAppCuration = {
    FeastAppCuration(
      id = source.id,
      issueDate = source.issueDate,
      edition = source.edition,
      version = version,
      fronts = source.fronts.map(f => {
        (transformName(f.getName), f.collections.map(transformCollections).toIndexedSeq)
      }).toMap
    )
  }

  override def putIssue(issue: EditionsIssue, version: String, action: PublishAction): Unit = {
    val outputKey = createKey(issue, version)
    putIssueJson(transformContent(issue, version), outputKey)
  }

  private def createPublishRequest(content: String, messageType: FeastPublicationTarget.MessageType): PublishRequest = {
    new PublishRequest()
      .withMessage(content)
      .withTopicArn(config.aws.feastAppPublicationTopic)
      .withMessageAttributes(Map(
        "timestamp" -> new MessageAttributeValue().withDataType("Number").withStringValue(timestamp.getTimestamp.toString),
        "type" -> new MessageAttributeValue().withDataType("String").withStringValue(messageType.toString),
      ).asJava)
  }

  override def putIssueJson[T: Writes](issue: T, key: String): Unit = {
    val content = Json.stringify(Json.toJson(issue))
    snsClient.publish(createPublishRequest(content, FeastPublicationTarget.MessageType.Issue))
  }

  override def putEditionsList(rawJson: String): Unit = {
    snsClient.publish(createPublishRequest(rawJson, FeastPublicationTarget.MessageType.EditionsList))
  }
}
