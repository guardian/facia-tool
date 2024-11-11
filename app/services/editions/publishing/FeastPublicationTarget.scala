package services.editions.publishing

import com.amazonaws.services.sns.AmazonSNS
import com.amazonaws.services.sns.model.{MessageAttributeValue, PublishRequest}
import conf.ApplicationConfiguration
import model.FeastAppModel.{
  Chef,
  ChefContent,
  ContainerItem,
  FeastAppContainer,
  FeastAppCuration,
  FeastCollection,
  FeastCollectionContent,
  Recipe,
  RecipeContent
}
import model.editions.PublishAction.PublishAction
import model.editions.{
  Edition,
  EditionsArticle,
  EditionsCard,
  EditionsChef,
  EditionsCollection,
  EditionsFeastCollection,
  EditionsIssue,
  EditionsRecipe,
  FeastAppTemplates
}
import play.api.libs.json.{Json, Writes}
import util.TimestampGenerator

import scala.jdk.CollectionConverters._
import logging.Logging

import scala.util.{Failure, Success}

object FeastPublicationTarget {
  object MessageType extends Enumeration {
    val Issue, EditionsList = Value
  }

  type MessageType = MessageType.Value
}

class FeastPublicationTarget(
    snsClient: AmazonSNS,
    config: ApplicationConfiguration,
    timestamp: TimestampGenerator
) extends PublicationTarget
    with Logging {
  private def transformCards(source: EditionsCard): ContainerItem = {
    source match {
      case _: EditionsArticle =>
        throw new Error("Article not permitted in a Feast Front")
      case EditionsRecipe(id, _) => Recipe(RecipeContent(id))
      case EditionsChef(id, _, metadata) =>
        Chef(
          ChefContent(
            id = id,
            image = metadata.flatMap(_.chefImageOverride.map(_.src)),
            bio = metadata.flatMap(_.bio),
            backgroundHex =
              metadata.flatMap(_.theme.map(_.palette.backgroundHex)),
            foregroundHex =
              metadata.flatMap(_.theme.map(_.palette.foregroundHex))
          )
        )
      case EditionsFeastCollection(_, _, metadata) =>
        val recipes = metadata
          .map(_.collectionItems.map { case EditionsRecipe(id, _) =>
            id
          })
          .getOrElse(List.empty)

        FeastCollection(
          FeastCollectionContent(
            byline = None,
            darkPalette = metadata.flatMap(_.theme.map(_.darkPalette)),
            lightPalette = metadata.flatMap(_.theme.map(_.lightPalette)),
            image = metadata.flatMap(_.theme.flatMap(_.imageURL)),
            body = Some(
              ""
            ), // The apps appear to require this to be present, even if it is empty
            title = metadata.flatMap(_.title).getOrElse("No title"),
            recipes = recipes
          )
        )
    }
  }

  private val findSpace = "\\s+".r

  /** Feast app expects a name like `all-recipes` wheras we have `All Recipes`
    *
    * @param originalName
    *   name to transform
    * @return
    *   name in kebab-case
    */
  private def transformName(originalName: String): String =
    findSpace.replaceAllIn(originalName.toLowerCase, "-")

  private def transformCollections(
      collection: EditionsCollection
  ): FeastAppContainer =
    FeastAppContainer(
      id = collection.id,
      title = collection.displayName,
      body =
        Some(""), // TBD, this is just how it appears in the data at the moment
      items = collection.items.map(transformCards)
    )

  def transformContent(
      source: EditionsIssue,
      version: String
  ): Either[String, FeastAppCuration] = {
    FeastAppTemplates.templates.get(source.edition) match {
      case Some(template) =>
        Right(
          FeastAppCuration(
            id = source.id,
            issueDate = source.issueDate,
            edition = source.edition,
            path = template.path,
            version = version,
            fronts = source.fronts
              .map(f => {
                (
                  transformName(f.getName),
                  f.collections.map(transformCollections).toIndexedSeq
                )
              })
              .toMap
          )
        )
      case None =>
        Left(
          s"No backend edition name found for issue ${source.edition.entryName}"
        )
    }
  }

  override def putIssue(
      issue: EditionsIssue,
      version: String,
      action: PublishAction
  ): Either[String, Unit] = {
    val outputKey = createKey(issue, version)
    for {
      content <- transformContent(issue, version)
    } yield putIssueJson(content, outputKey)
  }

  private def createPublishRequest(
      content: String,
      messageType: FeastPublicationTarget.MessageType
  ): PublishRequest = {
    new PublishRequest()
      .withMessage(content)
      .withTopicArn(config.aws.feastAppPublicationTopic)
      .withMessageAttributes(
        Map(
          "timestamp" -> new MessageAttributeValue()
            .withDataType("Number")
            .withStringValue(timestamp.getTimestamp.toString),
          "type" -> new MessageAttributeValue()
            .withDataType("String")
            .withStringValue(messageType.toString)
        ).asJava
      )
  }

  override def putIssueJson[T: Writes](issue: T, key: String): Unit = {
    val content = Json.stringify(Json.toJson(issue))

    logger.info(s"Publishing content for issue $key: $content")

    snsClient.publish(
      createPublishRequest(content, FeastPublicationTarget.MessageType.Issue)
    )
  }

  override def putEditionsList(rawJson: String): Unit = {
    snsClient.publish(
      createPublishRequest(
        rawJson,
        FeastPublicationTarget.MessageType.EditionsList
      )
    )
  }
}
