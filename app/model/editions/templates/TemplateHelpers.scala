package model.editions.templates

import model.editions.templates.EditionType.EditionType
import model.editions.{templates, _}
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

  implicit val readsEditionType: Reads[templates.EditionType.Value] = Reads.enumNameReads(EditionType)
  implicit val writesEditionType: Writes[templates.EditionType.Value] = Writes.enumNameWrites
}

case class Header (title: String, subTitle: Option[String] = None)
object Header {
  implicit val readsHeader: Reads[Header] = Json.reads[Header]
  implicit val writesHeader: Writes[Header] = Json.writes[Header]
}

trait EditionDefinition {
  val title: String
  val subTitle: String
  val edition: String
  val header: Header
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
    header: Header,
    editionType: EditionType
  ): EditionDefinition = EditionDefinitionRecord(title, subTitle, edition, header, editionType)

  def unapply(x: EditionDefinition): Option[(String, String, String, Header, EditionType)]
    = Some(x.title, x.subTitle, x.edition, x.header, x.editionType)

  implicit val formatEditionDefinition: OFormat[EditionDefinition] = Json.format[EditionDefinition]
  implicit val writesEditionDefinition: OWrites[EditionDefinition] = Json.writes[EditionDefinition]
  implicit val readsEditionDefinition: Reads[EditionDefinition] = Json.reads[EditionDefinition]
}

case class EditionDefinitionRecord(
                         override val title: String,
                         override val subTitle: String,
                         override val edition: String,
                         override val header: Header,
                         override val editionType: EditionType
) extends EditionDefinition {}

object EditionDefinitionRecord{
  implicit val editionDefinitionRecordFormat: OFormat[EditionDefinitionRecord] = Json.format[EditionDefinitionRecord]
  implicit val editionDefinitionRecordWrites: OWrites[EditionDefinitionRecord] = Json.writes[EditionDefinitionRecord]
  implicit val editionDefinitionRecordReads: Reads[EditionDefinitionRecord] = Json.reads[EditionDefinitionRecord]
}
