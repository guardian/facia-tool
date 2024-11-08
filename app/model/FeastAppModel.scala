package model

import play.api.libs.json._

import java.time.LocalDate
import model.editions.{Edition, Palette}

object FeastAppModel {
  sealed trait ContainerItem

  case class RecipeContent(id: String)

  case class Recipe(recipe: RecipeContent) extends ContainerItem

  case class Chef(chef: ChefContent) extends ContainerItem

  case class ChefContent(
      id: String,
      image: Option[String] = None,
      bio: Option[String] = None,
      backgroundHex: Option[String] = None,
      foregroundHex: Option[String] = None
  )

  case class FeastCollection(collection: FeastCollectionContent)
      extends ContainerItem

  case class FeastCollectionContent(
      byline: Option[String] = None,
      darkPalette: Option[Palette] = None,
      image: Option[String] = None,
      body: Option[String] = None,
      title: String,
      lightPalette: Option[Palette] = None,
      recipes: Seq[String]
  )

  case class FeastAppContainer(
      id: String,
      title: String,
      body: Option[String],
      items: Seq[ContainerItem]
  )
  // type FeastAppCuration = Map[String, IndexedSeq[FeastAppContainer]]

  case class FeastAppCuration(
      id: String,
      edition: Edition,
      path: String,
      issueDate: LocalDate,
      version: String,
      fronts: Map[String, IndexedSeq[FeastAppContainer]]
  )

  implicit val recipeIdentifierFormat: Format[RecipeContent] =
    Json.format[RecipeContent]
  implicit val recipeFormat: Format[Recipe] = Json.format[Recipe]
  implicit val chefContentFormat: Format[ChefContent] = Json.format[ChefContent]
  implicit val chefFormat: Format[Chef] = Json.format[Chef]
  implicit val paletteFormat: Format[Palette] = Json.format[Palette]
  implicit val subCollectionContentFormat: Format[FeastCollectionContent] =
    Json.format[FeastCollectionContent]
  implicit val subCollectionFormat: Format[FeastCollection] =
    Json.format[FeastCollection]

  implicit val containerItemFormat: Format[ContainerItem] = Format.apply(
    jsValue => {
      recipeFormat.reads(jsValue) orElse chefFormat.reads(
        jsValue
      ) orElse subCollectionFormat.reads(jsValue)
    },
    {
      case o: Recipe          => recipeFormat.writes(o)
      case o: Chef            => chefFormat.writes(o)
      case o: FeastCollection => subCollectionFormat.writes(o)
    }
  )
  implicit val feastAppContainerFormat: Format[FeastAppContainer] =
    Json.format[FeastAppContainer]
  implicit val feastAppCurationFormat: Format[FeastAppCuration] =
    Json.format[FeastAppCuration]

}
