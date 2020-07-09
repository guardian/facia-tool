package model.editions.templates

import model.editions.templates.EditionType.EditionType
import model.editions._
import play.api.libs.json._

object TemplateHelpers {
  object Defaults {
    val defaultFrontPresentation = FrontPresentation(model.editions.Swatch.Neutral)
    val defaultCollectionPresentation = CollectionPresentation()
    val defaultCollectionArticleItemsCap: Int = 200
  }

  def collection(name: String): CollectionTemplate = {
    CollectionTemplate(
      name,
      maybeOphanPath = None,
      prefill = None,
      presentation = Defaults.defaultCollectionPresentation
    )
  }

  def front(name: String, ophanPath: Option[String], collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(name, collections.toList, Defaults.defaultFrontPresentation, ophanPath)

  def front(name: String, collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(name, collections.toList, Defaults.defaultFrontPresentation, None)

  def specialFront(name: String, swatch: Swatch, ophanPath: Option[String] = None, prefill: Option[CapiPrefillQuery] = None): FrontTemplate = front(
    name,
    ophanPath,
    collection("Special Container 1").hide.copy(prefill = prefill),
    collection("Special Container 2").hide,
    collection("Special Container 3").hide,
    collection("Special Container 4").hide,
    collection("Special Container 5").hide,
    collection("Special Container 6").hide
  ).special
    .swatch(swatch)

}

case object EditionType extends Enumeration() {

  type EditionType = Value
  val Regional, Special, Training = Value

  implicit val readsMyEnum = Reads.enumNameReads(EditionType)
  implicit val writesMyEnum = Writes.enumNameWrites
}

trait EditionDefinition {
  val title: String
  val subTitle: String
  val edition: String
  val headerTitle: String
  val editionType: EditionType
}
trait EditionDefinitionWithTemplate extends EditionDefinition {
  val template: EditionTemplate
}
object EditionDefinition {
  def apply(
    title: String,
    subTitle: String,
    edition: String,
    headerTitle: String,
    editionType: EditionType
  ): EditionDefinition = EditionDefinitionRecord(title, subTitle, edition, headerTitle, editionType)

  def unapply(x: EditionDefinition): Option[(String, String, String, String, EditionType)]
    = Some(x.title, x.subTitle, x.edition, x.headerTitle, x.editionType)

  implicit val formatEditionDefinition: OFormat[EditionDefinition] = Json.format[EditionDefinition]
  implicit val writesEditionDefinition: OWrites[EditionDefinition] = Json.writes[EditionDefinition]
  implicit val readsEditionDefinition: Reads[EditionDefinition] = Json.reads[EditionDefinition]
}

case class EditionDefinitionRecord(
                         override val title: String,
                         override val subTitle: String,
                         override val edition: String,
                         override val headerTitle: String,
                         override val editionType: EditionType
) extends EditionDefinition {}

object EditionDefinitionRecord{
  implicit val editionDefinitionRecordFormat = Json.format[EditionDefinitionRecord]
  implicit val editionDefinitionRecordWrites = Json.writes[EditionDefinitionRecord]
  implicit val editionDefinitionRecordReads = Json.reads[EditionDefinitionRecord]
}
