package model

import common.{Edition, ManifestData, NavItem, Pagination}
import conf.Configuration
import play.api.libs.json.{JsBoolean, JsString, JsValue}

/**
 * MetaData represents a page on the site, whether facia or content
 */
trait MetaData extends Tags {
  def id: String
  def section: String
  def webTitle: String
  def analyticsName: String
  def url: String  = s"/$id"
  def webUrl: String = s"${Configuration.site.host}$url"
  def linkText: String = webTitle
  def pagination: Option[Pagination] = None
  def description: Option[String] = None
  def rssPath: Option[String] = None

  def hasSlimHeader: Boolean = contentType == "Interactive" || section == "identity"

  lazy val canonicalUrl: Option[String] = None

  // Special means "Next Gen platform only".
  private lazy val special = id.contains("-sp-")

  def title: Option[String] = None
  // this is here so it can be included in analytics.
  // Basically it helps us understand the impact of changes and needs
  // to be an integral part of each page
  def buildNumber: String = ManifestData.build
  def revision: String = ManifestData.revision

  //must be one of... http://schema.org/docs/schemas.html
  def schemaType: Option[String] = None

  lazy val isFront = false
  lazy val contentType = ""
  lazy val hideUi = false
  lazy val isImmersive = false

  def adUnitSuffix = section

  def hasPageSkin(edition: Edition) = false
  def hasAdInBelowTopNavSlot(edition: Edition) = false
  def omitMPUsFromContainers(edition: Edition) = false
  lazy val isInappropriateForSponsorship: Boolean = false

  lazy val membershipAccess: Option[String] = None
  lazy val requiresMembershipAccess: Boolean = false

  def isSurging: Seq[Int] = Seq(0)

  def metaData: Map[String, JsValue] = Map(
    ("pageId", JsString(id))
  )

  def openGraph: Map[String, String] = Map(
    "og:site_name" -> "the Guardian",
    "og:type"      -> "website"
  )

  def openGraphImages: Seq[String] = Seq()

  def cards: List[(String, String)] = List(
    "twitter:site" -> "@guardian") ++ (iosId("twitter") map (iosId => List(
    "twitter:app:name:iphone" -> "The Guardian",
    "twitter:app:id:iphone" -> "409128287",
    "twitter:app:url:iphone" -> s"gnmguardian://$iosId",
    "twitter:app:name:ipad" -> "The Guardian",
    "twitter:app:id:ipad" -> "409128287",
    "twitter:app:url:ipad" -> s"gnmguardian://$iosId",
    "twitter:app:name:googleplay" -> "The Guardian",
    "twitter:app:id:googleplay" -> "com.guardian"
  )) getOrElse Nil)

  def iosId(referrer: String): Option[String] = iosType.map(iosType => s"$id?contenttype=$iosType&source=$referrer")

  // this could be article/front/list, it's a hint to the ios app to start the right engine
  def iosType: Option[String] = None

  def cacheSeconds = 60

  def customSignPosting: Option[NavItem] = None

  def isPreferencesPage = metaData.get("isPreferencesPage").collect{ case prefs: JsBoolean => prefs.value } getOrElse false
}

class Page(
  val id: String,
  val section: String,
  val webTitle: String,
  val analyticsName: String,
  override val pagination: Option[Pagination] = None,
  override val description: Option[String] = None) extends MetaData

object Page {
  def apply(
    id: String,
    section: String,
    webTitle: String,
    analyticsName: String,
    pagination: Option[Pagination] = None,
    description: Option[String] = None,
    maybeContentType: Option[String] = None,
    maybeCanonicalUrl: Option[String] = None
  ) = new Page(id, section, webTitle, analyticsName, pagination, description) {
    override lazy val contentType = maybeContentType.getOrElse("")
    override lazy val canonicalUrl = maybeCanonicalUrl
    override def metaData: Map[String, JsValue] =
      super.metaData ++ maybeContentType.map(contentType => List("contentType" -> JsString(contentType))).getOrElse(Nil)
  }
}

object IsRatio {

  val AspectRatioThreshold = 0.01

  def apply(aspectWidth: Int, aspectHeight: Int, width: Int, height: Int): Boolean = {
    aspectHeight.toDouble * width != 0 &&
      Math.abs((aspectWidth.toDouble * height) / (aspectHeight.toDouble * width) - 1) <= AspectRatioThreshold
  }

}

/**
 * Tags lets you extract meaning from tags on a page.
 */
trait Tags {
  def tags: Seq[Tag] = Nil

  private def tagsOfType(tagType: String): Seq[Tag] = tags.filter(_.tagType == tagType)

  lazy val keywords: Seq[Tag] = tagsOfType("keyword")
  lazy val nonKeywordTags: Seq[Tag] = tags.filterNot(_.tagType == "keyword")
  lazy val contributors: Seq[Tag] = tagsOfType("contributor")
  lazy val isContributorPage: Boolean = contributors.nonEmpty
  lazy val series: Seq[Tag] = tagsOfType("series")
  lazy val blogs: Seq[Tag] = tagsOfType("blog")
  lazy val tones: Seq[Tag] = tagsOfType("tone")
  lazy val types: Seq[Tag] = tagsOfType("type")

  lazy val richLink: Option[String] = tags.flatMap(_.richLinkId).headOption
  lazy val openModule: Option[String] = tags.flatMap(_.openModuleId).headOption

  // Tones are all considered to be 'News' it is the default so we do not list news tones explicitly
  def isNews = !(isLiveBlog || isComment || isFeature)

  lazy val isLiveBlog: Boolean = tones.exists(t => Tags.liveMappings.contains(t.id))
  lazy val isComment = tones.exists(t => Tags.commentMappings.contains(t.id))
  lazy val isFeature = tones.exists(t => Tags.featureMappings.contains(t.id))
  lazy val isReview = tones.exists(t => Tags.reviewMappings.contains(t.id))
  lazy val isMedia = types.exists(t => Tags.mediaTypes.contains(t.id))
  lazy val isAnalysis = tones.exists(_.id == Tags.Analysis)
  lazy val isPodcast = isAudio && (types.exists(_.id == Tags.Podcast) || tags.exists(_.podcast.isDefined))
  lazy val isAudio = types.exists(_.id == Tags.Audio)
  lazy val isEditorial = tones.exists(_.id == Tags.Editorial)
  lazy val isCartoon = types.exists(_.id == Tags.Cartoon)
  lazy val isLetters = tones.exists(_.id == Tags.Letters)
  lazy val isCrossword = types.exists(_.id == Tags.Crossword)
  lazy val isMatchReport = tones.exists(_.id == Tags.MatchReports)

  lazy val isArticle: Boolean = tags.exists { _.id == Tags.Article }
  lazy val isSudoku: Boolean = tags.exists { _.id == Tags.Sudoku } || tags.exists(t => t.id == "lifeandstyle/series/sudoku")
  lazy val isGallery: Boolean = tags.exists { _.id == Tags.Gallery }
  lazy val isVideo: Boolean = tags.exists { _.id == Tags.Video }
  lazy val isPoll: Boolean = tags.exists { _.id == Tags.Poll }
  lazy val isImageContent: Boolean = tags.exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
  lazy val isInteractive: Boolean = tags.exists { _.id == Tags.Interactive }

  lazy val hasLargeContributorImage: Boolean = tagsOfType("contributor").filter(_.contributorLargeImagePath.nonEmpty).nonEmpty

  lazy val isCricketLiveBlog = isLiveBlog &&
    tags.exists(t => t.id == "sport/england-cricket-team") &&
    tags.exists(t => t.id == "sport/over-by-over-reports")

  lazy val isRugbyMatch = (isMatchReport || isLiveBlog) &&
    tags.exists(t => t.id == "sport/rugby-union")

  lazy val isClimateChangeSeries = tags.exists(t => t.id =="environment/series/keep-it-in-the-ground")
}

object Tags {
  val Analysis = "tone/analysis"
  val Audio = "type/audio"
  val Cartoon = "type/cartoon"
  val Crossword = "type/crossword"
  val Editorial = "tone/editorials"
  val Letters = "tone/letters"
  val Podcast = "type/podcast"
  val MatchReports = "tone/matchreports"

  val Article = "type/article"
  val Gallery = "type/gallery"
  val Video = "type/video"
  val Poll = "type/poll"
  val Interactive = "type/interactive"
  val Sudoku = "type/sudoku"

  val liveMappings = Seq(
    "tone/minutebyminute"
  )

  val commentMappings = Seq (
    "tone/comment"
  )

  val mediaTypes = Seq(
    "type/video",
    "type/audio",
    "type/gallery",
    "type/picture"
  )

  val featureMappings = Seq(
    "tone/features",
    "tone/recipes",
    "tone/interview",
    "tone/performances",
    "tone/extract",
    "tone/reviews",
    "tone/albumreview",
    "tone/livereview",
    "tone/childrens-user-reviews"
  )

  val reviewMappings = Seq(
    "tone/reviews"
  )
}
