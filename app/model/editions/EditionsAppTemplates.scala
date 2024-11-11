package model.editions

import java.time.temporal.ChronoField
import java.time.{LocalDate, ZoneId, ZoneOffset}
import enumeratum.EnumEntry.{Hyphencase, Uncapitalised}
import enumeratum.{EnumEntry, PlayEnum}
import model.editions.PathType.{PrintSent, Search}
import model.editions.templates.TemplateHelpers.Defaults
import model.editions.templates._
import model.editions.templates.feast.{
  FeastAppEdition,
  FeastNorthernHemisphere,
  FeastSouthernHemisphere
}
import org.postgresql.util.PGobject
import play.api.libs.json.{Json, OFormat}
import services.editions.prefills.CapiQueryTimeWindow

object EditionsAppTemplates {
  val templates: Map[Edition, EditionsAppDefinitionWithTemplate] = Map(
    Edition.DailyEdition -> DailyEdition,
    Edition.AustralianEdition -> AustralianEdition,
    Edition.TrainingEdition -> TrainingEdition,
    Edition.TheDummyEdition -> TheDummyEdition,
    Edition.EditionEarth -> EditionEarth,
    Edition.EditionBooks -> EditionBooks,
    Edition.EditionWeWereThere -> EditionWeWereThere,
    Edition.EditionEurosSpecial -> EditionEurosSpecial,
    Edition.EditionOlympicLegends -> EditionOlympicLegends,
    Edition.EditionEndOfYear -> EditionEndOfYear,
    Edition.EditionWellbeing -> EditionWellbeing
  )

  val getAvailableTemplates: List[EditionsAppDefinitionWithTemplate] =
    templates.values.toList

  /** Returns available Editons app templates as a Map which differentiates the
    * various classes of edition. This is used for grouping purposes in both the
    * UI and the publication logic
    * @return
    *   a Map relating the edition class to a list of the relevant types.
    */
  def getAvailableEditionsAppTemplates
      : Map[String, List[CuratedPlatformDefinition]] = {
    val allEditions = getAvailableTemplates
    val regionalEditions =
      allEditions.filter(e => e.editionType == EditionType.Regional)
    val specialEditions =
      allEditions.filter(e => e.editionType == EditionType.Special)
    val trainingEditions =
      allEditions.filter(e => e.editionType == EditionType.Training)

    Map(
      "regionalEditions" -> regionalEditions,
      "specialEditions" -> specialEditions,
      "trainingEditions" -> trainingEditions
    )
  }
}

object FeastAppTemplates {
  val templates: Map[Edition, FeastAppEdition] = Map(
    Edition.FeastNorthernHemisphere -> FeastNorthernHemisphere,
    Edition.FeastSouthernHemisphere -> FeastSouthernHemisphere
  )

  val getAvailableTemplates: List[CuratedPlatformWithTemplate] =
    templates.values.toList
}

object AllTemplates {
  val templates = EditionsAppTemplates.templates ++ FeastAppTemplates.templates
}

sealed trait CuratedPlatform extends EnumEntry with Uncapitalised

object CuratedPlatform extends PlayEnum[CuratedPlatform] {
  case object Editions extends CuratedPlatform

  case object Feast extends CuratedPlatform

  override def values = findValues
}

case object WeekDay extends Enumeration(1) {
  implicit lazy val implicitConversions: languageFeature.implicitConversions =
    scala.language.implicitConversions

  type WeekDay = Value
  val Mon, Tues, Wed, Thurs, Fri, Sat, Sun = Value

  implicit def WeekDayToInt(weekDay: WeekDay): Int = weekDay.id
}

sealed abstract class Swatch extends EnumEntry with Uncapitalised

object Swatch extends PlayEnum[Swatch] {

  case object Neutral extends Swatch

  case object News extends Swatch

  case object Opinion extends Swatch

  case object Culture extends Swatch

  case object Lifestyle extends Swatch

  case object Sport extends Swatch

  case object Special extends Swatch

  override def values = findValues
}

sealed abstract class Edition extends EnumEntry with Hyphencase

object Edition extends PlayEnum[Edition] {

  case object DailyEdition extends Edition

  case object AustralianEdition extends Edition

  case object TrainingEdition extends Edition

  case object TheDummyEdition extends Edition

  case object EditionEarth extends Edition

  case object EditionBooks extends Edition

  case object EditionWeWereThere extends Edition

  case object EditionEurosSpecial extends Edition

  case object EditionOlympicLegends extends Edition

  case object EditionEndOfYear extends Edition

  case object EditionWellbeing extends Edition

  case object FeastSouthernHemisphere extends Edition

  case object FeastNorthernHemisphere extends Edition

  override def values = findValues
}

case class FrontPresentation(swatch: Swatch) {
  implicit def frontPresentationFormat: OFormat[FrontPresentation] =
    Json.format[FrontPresentation]
}

object FrontPresentation {
  implicit def frontPresentationFormat: OFormat[FrontPresentation] =
    Json.format[FrontPresentation]
}

case class CapiPrefillQuery(queryString: String, pathType: PathType) {
  def escapedQueryString(): String =
    queryString
      .replace(",", "%2C")
      .replace("|", "%7C")
      .replace("(", "%28")
      .replace(")", "%29")
}

object CapiPrefillQuery {
  implicit def format: OFormat[CapiPrefillQuery] = Json.format[CapiPrefillQuery]
}

import model.editions.WeekDay._

trait Periodicity {
  def isValid(date: LocalDate): Boolean
}

case class Daily() extends Periodicity {
  def isValid(date: LocalDate) = true
}

case class WeekDays(days: List[WeekDay]) extends Periodicity {
  def isValid(date: LocalDate) =
    days.exists(
      WeekDayToInt(_) == date.getDayOfWeek.get(ChronoField.DAY_OF_WEEK)
    )
}

sealed abstract class PathType extends EnumEntry with Uncapitalised {
  def toPathSegment: String = {
    this match {
      case PathType.Search    => "search"
      case PathType.PrintSent => "content/print-sent"
    }
  }
}

object PathType extends PlayEnum[PathType] {

  case object Search extends PathType

  case object PrintSent extends PathType

  override def values = findValues
}

private[editions] case class CollectionTemplate(
    name: String,
    maybeOphanPath: Option[String] = None,
    prefill: Option[CapiPrefillQuery],
    maybeTimeWindowConfig: Option[CapiTimeWindowConfigInDays] = None,
    hidden: Boolean = false,
    cardCap: Int = Defaults.defaultCollectionCardsCap
) {

  def hide = copy(hidden = true)

  def printSentPrefill(prefillQuery: String) =
    copy(prefill = Some(CapiPrefillQuery(prefillQuery, PrintSent)))

  def printSentAnyTag(tags: String*) = printSentPrefill(
    s"?tag=${tags.mkString("|")}"
  )

  def printSentAllTags(tags: String*) = printSentPrefill(
    s"?tag=${tags.mkString(",")}"
  )

  def searchPrefill(prefillQuery: String) =
    copy(prefill = Some(CapiPrefillQuery(prefillQuery, Search)))

  def withCardItemsCap(articleItemsCap: Int) = copy(cardCap = articleItemsCap)

  def withTimeWindowConfig(
      maybeTimeWindowConfig: Option[CapiTimeWindowConfigInDays]
  ) = copy(maybeTimeWindowConfig = maybeTimeWindowConfig)
}

case class FrontTemplate(
    name: String,
    collections: List[CollectionTemplate],
    presentation: FrontPresentation,
    maybeOphanPath: Option[String] = None,
    maybeTimeWindowConfig: Option[CapiTimeWindowConfigInDays] = None,
    isSpecial: Boolean = false,
    hidden: Boolean = false
) {
  def special = copy(isSpecial = true, hidden = true)

  def swatch(swatch: Swatch) = copy(presentation = FrontPresentation(swatch))

  def withTimeWindowConfig(
      maybeTimeWindowConfig: Option[CapiTimeWindowConfigInDays]
  ) = copy(maybeTimeWindowConfig = maybeTimeWindowConfig)
}

sealed abstract class CapiDateQueryParam
    extends EnumEntry
    with Hyphencase
    with Uncapitalised

object CapiDateQueryParam extends PlayEnum[CapiDateQueryParam] {

  case object NewspaperEdition extends CapiDateQueryParam

  case object Published extends CapiDateQueryParam

  override def values = findValues
}

trait BaseTimeWindowConfig {
  def startOffset: Int

  def endOffset: Int
}

case class TimeWindowConfigInDays(startOffset: Int, endOffset: Int)
    extends BaseTimeWindowConfig

case class CapiTimeWindowConfigInDays(startOffset: Int, endOffset: Int)
    extends BaseTimeWindowConfig {
  def toCapiQueryTimeWindow(issueDate: LocalDate): CapiQueryTimeWindow = {
    val issueDateStart = issueDate.atStartOfDay()
    // Regarding UTC Hack because composer/capi/whoever doesn't worry about timezones in the newspaper-edition date
    val fromDateUTC =
      issueDateStart.plusDays(startOffset).toInstant(ZoneOffset.UTC)
    val toDateAsUTC =
      issueDateStart.plusDays(endOffset).toInstant(ZoneOffset.UTC)
    CapiQueryTimeWindow(fromDateUTC, toDateAsUTC)
  }
}

case class OphanQueryPrefillParams(
    apiKey: String,
    timeWindowConfig: TimeWindowConfigInDays
)

case class EditionTemplate(
    fronts: List[(FrontTemplate, Periodicity)],
    timeWindowConfig: CapiTimeWindowConfigInDays,
    capiDateQueryParam: CapiDateQueryParam,
    zoneId: ZoneId,
    availability: Periodicity,
    maybeOphanPath: Option[String] = None,
    ophanQueryPrefillParams: Option[OphanQueryPrefillParams]
)
