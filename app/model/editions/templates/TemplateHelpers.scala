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
  implicit val formatHeader: OFormat[Header] = Json.format[Header]
}

trait EditionDefinition {
  val title: String
  val subTitle: String
  val edition: String
  val header: Header
  val editionType: EditionType
  val notificationUTCOffset: Int
  val topic: String
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
    editionType: EditionType,
    notificationUTCOffset: Int,
    topic: String
  ): EditionDefinition = EditionDefinitionRecord(title, subTitle, edition, header, editionType, notificationUTCOffset, topic)

  def unapply(edition: EditionDefinition): Option[(String, String, String, Header, EditionType, Int, String)]
    = Some(edition.title, edition.subTitle, edition.edition, edition.header, edition.editionType, edition.notificationUTCOffset, edition.topic)

  implicit val formatEditionDefinition: OFormat[EditionDefinition] = Json.format[EditionDefinition]
}

case class EditionDefinitionRecord(
                         override val title: String,
                         override val subTitle: String,
                         override val edition: String,
                         override val header: Header,
                         override val editionType: EditionType,
                         override val notificationUTCOffset: Int,
                         override val topic: String
) extends EditionDefinition {}


object EditionDefinitionRecord{
  implicit val editionDefinitionRecordFormat: OFormat[EditionDefinitionRecord] = Json.format[EditionDefinitionRecord]
}
