package services.editions.publishing.transform
import play.api.libs.json._

object FeastAppModel {
  sealed trait ContainerItem

  case class RecipeIdentifier(id:String)
  case class Recipe(recipe:RecipeIdentifier) extends ContainerItem
  case class Chef(backgroundHex:Option[String], id:String, image:Option[String], bio: String, foregroundHex:Option[String]) extends ContainerItem
  case class Palette(backgroundHex:String, foregroundHex:String)
  case class SubCollection(byline:Option[String], darkPalette:Option[Palette], image:Option[String], body:Option[String], title:String, lightPalette:Option[Palette], recipes:Seq[String]) extends ContainerItem

  case class FeastAppContainer(id:String, title:String, body:Option[String], items:Seq[ContainerItem])
  type FeastAppCuration = Map[String, IndexedSeq[FeastAppContainer]]

  implicit val recipeIdentifierFormat:Format[RecipeIdentifier] = Json.format[RecipeIdentifier]
  implicit val recipeFormat:Format[Recipe] = Json.format[Recipe]
  implicit val chefFormat:Format[Chef] = Json.format[Chef]
  implicit val paletteFormat:Format[Palette] = Json.format[Palette]
  implicit val subCollectionFormat:Format[SubCollection] = Json.format[SubCollection]

  implicit val containerItemFormat:Format[ContainerItem] = Format.apply(
    jsValue=> {
      recipeFormat.reads(jsValue) orElse chefFormat.reads(jsValue) orElse subCollectionFormat.reads(jsValue)
    },
    {
      case o:Recipe=>recipeFormat.writes(o)
      case o:Chef=>chefFormat.writes(o)
      case o:SubCollection=>subCollectionFormat.writes(o)
    }
  )
  implicit val feastAppContainerFormat:Format[FeastAppContainer] = Json.format[FeastAppContainer]
  //No explicit formatter required for the root level, because it's just a map

}
