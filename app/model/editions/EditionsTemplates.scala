package model.editions

import java.time.temporal.ChronoField
import java.time.{LocalDate, ZoneId}

import enumeratum.EnumEntry.{Hyphencase, Uncapitalised}
import enumeratum.{EnumEntry, PlayEnum}
import model.editions.PathType.{PrintSent, Search}
import model.editions.templates.{DailyEdition, AmericanEdition, AustralianEdition, TrainingEdition}
import org.postgresql.util.PGobject
import play.api.libs.json.Json

object EditionsTemplates {
  val templates: Map[Edition, EditionTemplate] = Map(
    Edition.DailyEdition -> DailyEdition.template,
    Edition.AmericanEdition -> AmericanEdition.template,
    Edition.AustralianEdition -> AustralianEdition.template,
    Edition.TrainingEdition -> TrainingEdition.template
  )

  val getAvailableEditions: List[Edition] = templates.keys.toList
}

case object WeekDay extends Enumeration(1) {
  implicit lazy val implicitConversions = scala.language.implicitConversions

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
  case object AmericanEdition extends Edition
  case object AustralianEdition extends Edition
  case object TrainingEdition extends Edition

  override def values = findValues
}


case class FrontPresentation(swatch: Swatch) {
  implicit def frontPresentationFormat = Json.format[FrontPresentation]
}

object FrontPresentation {
  implicit def frontPresentationFormat = Json.format[FrontPresentation]
}

case class CollectionPresentation()

object CapiPrefillQuery {

  implicit def format = Json.format[CapiPrefillQuery]

  val start = "?tag="

  val and = ","
  val or = "|"
  val not = "-"


  val allNewsTag = "tone/news"
  val reviews = "tone/reviews"
  val comments = "tone/comment"
  val features = "tone/features"
  val longReadTag = "news/series/the-long-read"
  val interviews = "tone/interviews"
  val recipes = "tone/recipes"

  val crossword = "type/crossword"

  val sport = "sport/sport"
  val football = "football/football"
  val womensLeagueFootball = "football/w-league"
  val horseracing = "sport/horse-racing"
  val rugbyLeague = "sport/rugbyleague"
  val boxing = "sport/boxing"
  val golf = "sport/golf"
  val tennis = "sport/tennis"
  val cycling = "sport/cycling"
  val formulaOne = "sport/formulaone"
  val cricket = "sport/cricket"
  val rugbyUnion = "sport/rugby-union"
  val australianRulesFootball = "sport/australian-rules-football"

  val fashion = "fashion/fashion"
  val australiaNews = "australia-news/australia-news"
  val lifeAndStyle = "lifeandstyle/lifeandstyle"
  val loveAndSex = "lifeandstyle/love-and-sex"
  val celebrity = "lifeandstyle/celebrity"
  val food = "food/food"
  val travel = "travel/travel"
  val healthAndWellbeing = "lifeandstyle/health-and-wellbeing"
  val women = "lifeandstyle/women"
  val homeAndGarden = "lifeandstyle/home-and-garden"
  val money = "money/money"
  val technologyMotoring = "technology/motoring"
  val music = "music/music"
  val books = "books/books"
  val stage = "stage/stage"
  val classicalMusicAndOpera = "music/classical-music-and-opera"
  val artAndDesign = "artanddesign/artanddesign"
  val games = "games/games"
  val tvAndRadio = "tv-and-radio/tv-and-radio"
  val film = "film/film"
  val culture = "culture/culture"

}
case class CapiPrefillQuery(queryString: String, pathType: PathType) {
  def escapedQueryString(): String =
    queryString
      .replace(",", "%2C")
      .replace("|", "%7C")
      .replace("(", "%28")
      .replace(")", "%29")
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
      case PathType.Search => "search"
      case PathType.PrintSent => "content/print-sent"
    }
  }
}

object PathType extends PlayEnum[PathType] {

  case object Search extends PathType

  case object PrintSent extends PathType

  override def values = findValues
}

case class CollectionTemplate(
  name: String,
  prefill: Option[CapiPrefillQuery],
  presentation: CollectionPresentation,
  hidden: Boolean = false
) {
  def special = copy(hidden = true)
  def withPresentation(presentation: CollectionPresentation) = copy(presentation = presentation)
  def printSentPrefill(prefillQuery: String) = copy(prefill = Some(CapiPrefillQuery(prefillQuery, PrintSent)))
  def printSentAnyTag(tags: String*) = printSentPrefill(s"?tag=${tags.mkString("|")}")
  def printSentAllTags(tags: String*) = printSentPrefill(s"?tag=${tags.mkString(",")}")

  def searchPrefill(prefillQuery: String) = {
    import model.editions.CapiPrefillQuery.start
    copy(prefill = Some(CapiPrefillQuery(start + prefillQuery, Search)))
  }
}

case class FrontTemplate(
                          name: String,
                          collections: List[CollectionTemplate],
                          presentation: FrontPresentation,
                          maybeOphanPath: Option[String],
                          isSpecial: Boolean = false,
                          hidden: Boolean = false
) {
  def special = copy(isSpecial = true, hidden = true)
  def swatch(swatch: Swatch) = copy(presentation = FrontPresentation(swatch))
}

case class TimeWindowConfigInDays(startOffset: Int, endOffset: Int)
case class CapiQueryPrefillParams(timeWindowConfig: TimeWindowConfigInDays)
case class OphanQueryPrefillParams(apiKey: String, timeWindowConfig: TimeWindowConfigInDays)

case class EditionTemplate(
  fronts: List[(FrontTemplate, Periodicity)],
  capiQueryPrefillParams: CapiQueryPrefillParams,
  zoneId: ZoneId,
  availability: Periodicity,
  ophanQueryPrefillParams: Option[OphanQueryPrefillParams]
)

// Issue skeletons are what is generated when you create a new issue for a given date
// (Date + Template) => Skeleton
case class EditionsIssueSkeleton(
  issueDate: LocalDate,
  zoneId: ZoneId,
  fronts: List[EditionsFrontSkeleton]
)

case class EditionsFrontSkeleton(
  name: String,
  collections: List[EditionsCollectionSkeleton],
  presentation: FrontPresentation,
  hidden: Boolean,
  isSpecial: Boolean
) {
  def metadata() = {
    val metadataParam = new PGobject()
    metadataParam.setType("jsonb")
    metadataParam.setValue(Json.toJson(EditionsFrontMetadata(None, Some(presentation.swatch))).toString)
    metadataParam
  }
}


case class EditionsCollectionSkeleton(
  name: String,
  items: List[EditionsArticleSkeleton],
  prefill: Option[CapiPrefillQuery],
  presentation: CollectionPresentation,
  hidden: Boolean
)

case class EditionsArticleSkeleton(
  pageCode: String,
  metadata: ArticleMetadata
)
