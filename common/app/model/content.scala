package model

import java.net.URL

import com.gu.contentapi.client.model.{Content => ApiContent}
import com.gu.facia.api.utils._
import com.gu.facia.client.models.TrailMetaData
import common.Reference
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.safety.Whitelist
import org.scala_tools.time.Imports._
import play.api.libs.json._
import com.gu.contentapi.client.{model => contentapi}

import scala.collection.JavaConversions._
import scala.language.postfixOps
import scala.util.Try

/**
 * a combination of CAPI content and things from facia tool, in one place
 */
class Content protected (val delegate: contentapi.Content) extends Trail with MetaData with ShareLinks {

  lazy val publication: String = fields.getOrElse("publication", "")
  lazy val lastModified: DateTime = fields.get("lastModified").map(_.parseISODateTime).getOrElse(DateTime.now)
  lazy val internalPageCode: String = delegate.safeFields("internalPageCode")
  lazy val shortUrl: String = delegate.safeFields("shortUrl")
  lazy val shortUrlId: String = delegate.safeFields("shortUrl").replace("http://gu.com", "")
  override lazy val webUrl: String = delegate.webUrl
  lazy val standfirst: Option[String] = fields.get("standfirst")
  lazy val contributorBio: Option[String] = fields.get("contributorBio")
  lazy val starRating: Option[Int] = fields.get("starRating").flatMap(s => Try(s.toInt).toOption)
  lazy val shortUrlPath: String = shortUrl.replace("http://gu.com", "")
  lazy val allowUserGeneratedContent: Boolean = fields.get("allowUgc").exists(_.toBoolean)
  lazy val isExpired = delegate.isExpired.getOrElse(false)
  lazy val isBlog: Boolean = blogs.nonEmpty
  lazy val isSeries: Boolean = series.nonEmpty
  lazy val productionOffice: Option[String] = delegate.safeFields.get("productionOffice")
  lazy val displayHint: String = fields.getOrElse("displayHint", "")

  lazy val showInRelated: Boolean = delegate.safeFields.get("showInRelatedContent").contains("true")
  lazy val hasSingleContributor: Boolean = {
    (contributors.headOption, byline) match {
      case (Some(t), Some(b)) => contributors.length == 1 && t.name == b
      case _ => false
    }
  }

  lazy val cardStyle: CardStyle = CardStyle.apply(delegate, TrailMetaData.empty)

  lazy val hasBeenModified: Boolean = {
    new Duration(webPublicationDate, lastModified).isLongerThan(Duration.standardSeconds(60))
  }

  lazy val hasTonalHeaderIllustration: Boolean = isLetters

  lazy val showCircularBylinePicAtSide: Boolean =
    cardStyle == Feature && hasLargeContributorImage && contributors.length == 1

  override lazy val isInappropriateForSponsorship: Boolean = fields.get("isInappropriateForSponsorship").exists(_.toBoolean)

  lazy val references = delegate.references.map(ref => (ref.`type`, Reference(ref.id)._2)).toMap

  lazy val witnessAssignment = references.get("witness-assignment")
  lazy val isbn: Option[String] = references.get("isbn")
  lazy val imdb: Option[String] = references.get("imdb")

  lazy val syndicationType = {
    if(isBlog){
      "blog"
    } else if (isGallery){
      "gallery"
    } else if(isPodcast){
      "podcast"
    } else if (isAudio){
      "audio"
    } else if(isVideo){
      "video"
    } else {
      "article"
    }
  }

  private lazy val fields: Map[String, String] = delegate.safeFields

  // Inherited from Trail
  override lazy val webPublicationDate: DateTime = delegate.webPublicationDateOption.getOrElse(DateTime.now)
  override lazy val linkText: String = webTitle
  override lazy val url: String = SupportedUrl(delegate)
  override lazy val section: String = delegate.sectionId.getOrElse("")
  override lazy val sectionName: String = delegate.sectionName.getOrElse("")
  override lazy val isLive: Boolean = fields.get("liveBloggingNow").exists(_.toBoolean)
  override lazy val discussionId = Some(shortUrlPath)
  override lazy val isCommentable: Boolean = fields.get("commentable").exists(_.toBoolean)
  override lazy val isClosedForComments: Boolean = !fields.get("commentCloseDate").exists(_.parseISODateTime.isAfterNow)
  override lazy val leadingParagraphs: List[org.jsoup.nodes.Element] = {
    val body = delegate.safeFields.get("body")
    val souped = body flatMap { body =>
      val souped = Jsoup.parseBodyFragment(body).body().select("p")
      Option(souped) map { _.toList }
    }

    souped getOrElse Nil
  }

  lazy val wordCount: Int = {
    Jsoup.clean(delegate.safeFields.getOrElse("body",""), Whitelist.none()).split("\\s+").size
  }

  override lazy val trailType: Option[String] = {
    if (tags.exists(_.id == "tone/comment")) {
      Option("comment")
    } else if (tags.exists(_.id == "tone/features")) {
      Option("feature")
    } else {
      Option("news")
    }
  }

  // Inherited from Tags
  override lazy val tags: Seq[Tag] = delegate.tags map { Tag(_) }

  // Inherited from MetaData
  override lazy val id: String = delegate.id
  override lazy val webTitle: String = delegate.webTitle
  override lazy val analyticsName = s"GFE:$section:${id.substring(id.lastIndexOf("/") + 1)}"
  override lazy val description: Option[String] = trailText

  // draft content may not have a headline. In that case just go with empty. We expect live content to have a headline
  override lazy val headline: String = fields.getOrDefault("headline", "")

  override lazy val trailText: Option[String] = fields.get("trailText")
  // old bylines can have html http://content.guardianapis.com/commentisfree/2012/nov/10/cocoa-chocolate-fix-under-threat?show-fields=byline
  override lazy val byline: Option[String] = fields.get("byline").map(stripHtml)
  override val showByline = resolvedMetaData.showByline

  override lazy val cacheSeconds = {
    if (isLive) 5
    else if (lastModified > DateTime.now(lastModified.getZone) - 1.hour) 10
    else if (lastModified > DateTime.now(lastModified.getZone) - 24.hours) 30
    else 300
  }

  private lazy val resolvedMetaData: ResolvedMetaData = {
    val cardStyle = CardStyle(delegate, TrailMetaData.empty)
    ResolvedMetaData.fromContentAndTrailMetaData(delegate, TrailMetaData.empty, cardStyle)
  }

  lazy val contributorTwitterHandle: Option[String] = contributors.headOption.flatMap(_.twitterHandle)

  override lazy val adUnitSuffix: String = super.adUnitSuffix + "/" + contentType.toLowerCase

  lazy val showSectionNotTag: Boolean = tags.exists{ tag => tag.id == "childrens-books-site/childrens-books-site" && tag.tagType == "blog" }

  lazy val sectionLabelLink : String = {
    if (showSectionNotTag) {
      section
    } else tags.find(_.isKeyword) match {
      case Some(tag) => tag.id
      case _ => ""
    }
  }

  lazy val sectionLabelName : String = {
    if(this.showSectionNotTag) sectionName else tags.find(_.isKeyword) match {
      case Some(tag) => tag.webTitle
      case _ => ""
    }
  }

  lazy val seriesTag: Option[Tag] = {
    blogs.find{tag => tag.id != "commentisfree/commentisfree"}.orElse(series.headOption)
  }

  def showFooterContainers = false

  override def iosType = Some("article")
}

object Content {

  def apply(apiContent: contentapi.Content): Content = {
    apiContent match {
      case _ => new Content(apiContent)
    }
  }
}

private object ArticleSchemas {
  def apply(article: Article): String = {
    // http://schema.org/NewsArticle
    // http://schema.org/Review
    if (article.isReview)
      "http://schema.org/Review"
    else if (article.isLiveBlog)
      "http://schema.org/LiveBlogPosting"
    else
      "http://schema.org/NewsArticle"
  }
}

class Article(delegate: contentapi.Content) extends Content(delegate) {
  lazy val main: String = delegate.safeFields.getOrElse("main","")
  lazy val body: String = delegate.safeFields.getOrElse("body","")
  override lazy val contentType = "Article"

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
  override def schemaType = Some(ArticleSchemas(this))


  lazy val hasVideoAtTop: Boolean = Jsoup.parseBodyFragment(body).body().children().headOption
    .exists(e => e.hasClass("gu-video") && e.tagName() == "video")

  lazy val mainVideoCanonicalPath: Option[String] = Jsoup.parseBodyFragment(main).body.getElementsByClass("element-video").headOption.map { v =>
    new URL(v.attr("data-canonical-url")).getPath.stripPrefix("/")
  }

  lazy val hasSupporting: Boolean = {
    val supportingClasses = Set("element--showcase", "element--supporting", "element--thumbnail")
    val leftColElements = Jsoup.parseBodyFragment(body).select("body > *").find(_.classNames.intersect(supportingClasses).size > 0)
    leftColElements.isDefined
  }

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary_large_image"
  )

  override def showFooterContainers = !isLiveBlog
}

class LiveBlog(delegate: contentapi.Content) extends Article(delegate) {
  private lazy val soupedBody = Jsoup.parseBodyFragment(body).body()
  lazy val hasKeyEvents: Boolean = soupedBody.select(".is-key-event").nonEmpty
  lazy val isSport: Boolean = tags.exists(_.id == "sport/sport")
  override protected lazy val elementShareOrder = List("facebook", "twitter", "gplus")

  override def cards: List[(String, String)] = super.cards ++ List(
    "twitter:card" -> "summary"
  )
}

abstract class Media(delegate: contentapi.Content) extends Content(delegate) {

  lazy val body: Option[String] = delegate.safeFields.get("body")
  override def metaData: Map[String, JsValue] = super.metaData ++ Map("isPodcast" -> JsBoolean(isPodcast))

  override lazy val analyticsName = s"GFE:$section:$contentType:${id.substring(id.lastIndexOf("/") + 1)}"
}
