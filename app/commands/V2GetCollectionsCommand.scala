package commands

import scala.concurrent.{ExecutionContext, Future}
import services.{CollectionService, CollectionAndStoriesResponse}
import controllers.{CollectionSpec}

case class V2GetCollectionsCommand(
    collectionService: CollectionService,
    collectionSpecs: List[CollectionSpec]
)(implicit
    ec: ExecutionContext
) {
  import V2GetCollectionsCommand._
  def process(): Future[List[CollectionAndStoriesResponse]] =
    collectionService
      .fetchCollectionsAndStoriesVisible(collectionSpecs.map(_.id))
      .map(keepOnlyNewerCollectionData(collectionSpecs, _))
}

object V2GetCollectionsCommand {
  def keepOnlyNewerCollectionData(
      specs: List[CollectionSpec],
      responses: List[Option[CollectionAndStoriesResponse]]
  ): List[CollectionAndStoriesResponse] =
    for {
      (Some(response), spec) <- responses.zip(specs)
      if response.wasUpdatedAfter(spec.lastUpdated)
    } yield response
}
