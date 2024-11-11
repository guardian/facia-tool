package config

import com.gu.facia.client.models.{CollectionConfigJson, ConfigJson, FrontJson}
import com.gu.pandomainauth.model.User
import frontsapi.model.UpdateActions
import play.api.libs.json.Json
import services.{ConfigAgent, IdGeneration, S3FrontsApi}
import updates.CreateFront
import util.SanitizeInput

class UpdateManager(
    val updateActions: UpdateActions,
    val configAgent: ConfigAgent,
    val s3FrontsApi: S3FrontsApi
) {

  /** To attempt to alleviate the problem of concurrent updates stomping one
    * another, we reload the config from S3, apply the change, then write it
    * back.
    *
    * Although this will work as a palliative measure it does not solve the
    * underlying problem, which is that something that is being edited at quite
    * a granular level is being written to and from persistence in one large
    * data structure.
    *
    * In the future we should look at separating out the config into a more
    * appropriate representation.
    *
    * @param transform
    *   The transformation to apply
    */
  private def transformConfig(
      transform: ConfigJson => ConfigJson,
      identity: User
  ): Unit = {
    s3FrontsApi.getMasterConfig foreach { configString =>
      val configJson = Json.parse(configString)
      val config = configJson.asOpt[ConfigJson] getOrElse {
        throw new RuntimeException(
          s"Unable to de-serialize config from S3: $configJson"
        )
      }

      val transformedConfig: ConfigJson = transform(config)
      val newConfig =
        SanitizeInput.fromConfigSeo(Transformations.prune(transformedConfig))
      updateActions.putMasterConfig(newConfig, identity)
      configAgent.refreshWith(transformedConfig)
    }
  }

  def createFront(request: CreateFront, identity: User): String = {
    val newCollectionId = IdGeneration.nextId
    transformConfig(
      Transformations.createFront(request, newCollectionId),
      identity
    )
    newCollectionId
  }

  def updateFront(id: String, newVersion: FrontJson, identity: User): Unit = {
    transformConfig(Transformations.updateFront(id, newVersion), identity)
  }

  def addCollection(
      frontIds: List[String],
      collection: CollectionConfigJson,
      identity: User
  ): String = {
    val newCollectionId = IdGeneration.nextId
    transformConfig(
      Transformations.updateCollection(frontIds, newCollectionId, collection),
      identity
    )
    newCollectionId
  }

  def updateCollection(
      id: String,
      frontIds: List[String],
      collection: CollectionConfigJson,
      identity: User
  ): Unit = {
    transformConfig(
      Transformations.updateCollection(frontIds, id, collection),
      identity
    )
  }
}
