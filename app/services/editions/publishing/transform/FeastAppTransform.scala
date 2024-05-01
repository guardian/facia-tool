package services.editions.publishing.transform

import model.editions.{PublishableIssue, PublishedArticle, PublishedCollection}
import play.api.libs.json.Writes
import services.editions.publishing.PublicationTransform
import FeastAppModel._


class FeastAppTransform extends PublicationTransform[FeastAppCuration] {
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

  override def transformContent(source: PublishableIssue)(implicit evidence: Writes[FeastAppCuration]): FeastAppCuration = {
    source.fronts.map(f=>{
      (transformName(f.name), f.collections.map(transformCollections).toIndexedSeq)
    })
  }.toMap
}

object FeastAppTransform {
  def apply() = new FeastAppTransform
}
