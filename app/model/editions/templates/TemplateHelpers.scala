package model.editions.templates

import model.editions.templates.EditionType.EditionType
import model.editions.{templates, _}
import play.api.libs.json._

object TemplateHelpers {
  object Defaults {
    val defaultFrontPresentation = FrontPresentation(
      model.editions.Swatch.Neutral
    )
    val defaultCollectionCardsCap: Int = 200
  }

  def collection(name: String): CollectionTemplate = {
    CollectionTemplate(
      name,
      maybeOphanPath = None,
      prefill = None
    )
  }

  def front(
      name: String,
      ophanPath: Option[String],
      collections: CollectionTemplate*
  ): FrontTemplate =
    FrontTemplate(
      name,
      collections.toList,
      Defaults.defaultFrontPresentation,
      ophanPath
    )

  def front(name: String, collections: CollectionTemplate*): FrontTemplate =
    FrontTemplate(
      name,
      collections.toList,
      Defaults.defaultFrontPresentation,
      None
    )

  def specialFront(
      name: String,
      swatch: Swatch,
      ophanPath: Option[String] = None,
      prefill: Option[CapiPrefillQuery] = None
  ): FrontTemplate = front(
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

  implicit val readsEditionType: Reads[templates.EditionType.Value] =
    Reads.enumNameReads(EditionType)
  implicit val writesEditionType: Writes[templates.EditionType.Value] =
    Writes.enumNameWrites
}

case class Header(title: String, subTitle: Option[String] = None)
object Header {
  implicit val formatHeader: OFormat[Header] = Json.format[Header]
}

case class SpecialEditionHeaderStyles(
    backgroundColor: String,
    textColorPrimary: String,
    textColorSecondary: String
)
object SpecialEditionHeaderStyles {
  implicit val formatHeader: OFormat[SpecialEditionHeaderStyles] =
    Json.format[SpecialEditionHeaderStyles]
}

case class EditionTextFormatting(
    color: String,
    font: String,
    lineHeight: Int,
    size: Int
)
object EditionTextFormatting {
  implicit val formatEditionTextFormatting: OFormat[EditionTextFormatting] =
    Json.format[EditionTextFormatting]
}

case class EditionImageStyle(width: Int, height: Int)
object EditionImageStyle {
  implicit val formatEditionImageStyle: OFormat[EditionImageStyle] =
    Json.format[EditionImageStyle]
}

case class SpecialEditionButtonStyles(
    backgroundColor: String,
    title: EditionTextFormatting,
    subTitle: EditionTextFormatting,
    expiry: EditionTextFormatting,
    image: EditionImageStyle
)

object SpecialEditionButtonStyles {
  implicit val formatSpecialEditionButtonStyles
      : OFormat[SpecialEditionButtonStyles] =
    Json.format[SpecialEditionButtonStyles]
}

/** A curated product that has a push publication model – it pushes updated
  * content to the world in discrete 'editions' that contain a list of fronts.
  *
  * Contrast with e.g. web/app Fronts, which publish their content in real time
  * on a container by container basis.
  */
trait CuratedPlatformDefinition {
  val title: String
  val subTitle: String
  val edition: String
  val notificationUTCOffset: Int
  val locale: Option[String]
  val platform: CuratedPlatform
}

object CuratedPlatformDefinition {
  implicit def formatCuratedPlatform(implicit
      editionsWrites: OWrites[EditionsAppDefinition],
      genericWrites: OWrites[CuratedPlatformWithTemplate]
  ): OWrites[CuratedPlatformDefinition] = {
    case editionsApp: EditionsAppDefinition =>
      editionsWrites.writes(editionsApp)
    case genericApp: CuratedPlatformWithTemplate =>
      genericWrites.writes(genericApp)
  }
}

/** An Edition definition for the Editions app.
  */
trait EditionsAppDefinition extends CuratedPlatformDefinition {
  val header: Header
  val topic: String
  val editionType: EditionType
  val buttonImageUri: Option[String]
  val expiry: Option[String]
  val buttonStyle: Option[SpecialEditionButtonStyles]
  val headerStyle: Option[SpecialEditionHeaderStyles]
  override val platform: CuratedPlatform = CuratedPlatform.Editions
}

trait TemplatedPlatform {
  val template: EditionTemplate
}

trait CuratedPlatformWithTemplate
    extends CuratedPlatformDefinition
    with TemplatedPlatform

object CuratedPlatformWithTemplate {
  import play.api.libs.functional.syntax._
  implicit def writes: OWrites[CuratedPlatformWithTemplate] = (
    (JsPath \ "title").write[String] and
      (JsPath \ "subTitle").write[String] and
      (JsPath \ "edition").write[String] and
      (JsPath \ "notificationUTCOffset").write[Int] and
      (JsPath \ "locale").writeNullable[String] and
      (JsPath \ "platform").write[CuratedPlatform]
  )(p =>
    (
      p.title,
      p.subTitle,
      p.edition,
      p.notificationUTCOffset,
      p.locale,
      p.platform
    )
  )
}
trait EditionsAppDefinitionWithTemplate
    extends EditionsAppDefinition
    with TemplatedPlatform

abstract class EditionBase extends EditionsAppDefinitionWithTemplate {
  override val buttonImageUri: Option[String] = None
  override val expiry: Option[String] = None
  override val buttonStyle: Option[SpecialEditionButtonStyles] = None
  override val headerStyle: Option[SpecialEditionHeaderStyles] = None
}

abstract class RegionalEdition extends EditionBase {
  override val editionType: EditionType = EditionType.Regional
}

abstract class InternalEdition extends EditionBase {
  override val editionType: EditionType = EditionType.Training
}

abstract class SpecialEdition extends EditionsAppDefinitionWithTemplate {
  override val editionType: EditionType = EditionType.Special
  override val locale: Option[String] = None
}

object EditionsAppDefinition {
  def apply(
      title: String,
      subTitle: String,
      edition: String,
      header: Header,
      editionType: EditionType,
      notificationUTCOffset: Int,
      topic: String,
      locale: Option[String],
      buttonImageUri: Option[String],
      expiry: Option[String],
      buttonStyle: Option[SpecialEditionButtonStyles],
      headerStyle: Option[SpecialEditionHeaderStyles],
      platform: CuratedPlatform
  ): EditionsAppDefinition = EditionDefinitionRecord(
    title,
    subTitle,
    edition,
    header,
    editionType,
    notificationUTCOffset,
    topic,
    locale,
    buttonImageUri,
    expiry,
    buttonStyle,
    headerStyle,
    platform
  )

  def unapply(edition: EditionsAppDefinition): Option[
    (
        String,
        String,
        String,
        Header,
        EditionType,
        Int,
        String,
        Option[String],
        Option[String],
        Option[String],
        Option[SpecialEditionButtonStyles],
        Option[SpecialEditionHeaderStyles],
        CuratedPlatform
    )
  ] = Some(
    edition.title,
    edition.subTitle,
    edition.edition,
    edition.header,
    edition.editionType,
    edition.notificationUTCOffset,
    edition.topic,
    edition.locale,
    edition.buttonImageUri,
    edition.expiry,
    edition.buttonStyle,
    edition.headerStyle,
    edition.platform
  )

  implicit val formatEditionDefinition: OFormat[EditionsAppDefinition] =
    Json.format[EditionsAppDefinition]
}

case class EditionDefinitionRecord(
    override val title: String,
    override val subTitle: String,
    override val edition: String,
    override val header: Header,
    override val editionType: EditionType,
    override val notificationUTCOffset: Int,
    override val topic: String,
    override val locale: Option[String],
    override val buttonImageUri: Option[String],
    override val expiry: Option[String],
    override val buttonStyle: Option[SpecialEditionButtonStyles],
    override val headerStyle: Option[SpecialEditionHeaderStyles],
    override val platform: CuratedPlatform
) extends EditionsAppDefinition {}

object EditionDefinitionRecord {
  implicit val editionDefinitionRecordFormat: OFormat[EditionDefinitionRecord] =
    Json.format[EditionDefinitionRecord]
}
