package model

import com.gu.contentapi.client.model.{Tag => ApiTag, Podcast}
import common.{Pagination, Reference}
import conf.Configuration
import play.api.libs.json.{JsArray, JsString, JsValue}

case class Tag(private val delegate: ApiTag, override val pagination: Option[Pagination] = None) extends MetaData with AdSuffixHandlingForFronts {
  lazy val name: String = webTitle
  lazy val tagType: String = delegate.`type`

  lazy val id: String = delegate.id

  // some tags e.g. tone do not have an explicit section
  lazy val section: String = delegate.sectionId.getOrElse("global")

  override lazy val webUrl: String = delegate.webUrl
  lazy val webTitle: String = delegate.webTitle
  lazy val sectionName: String = delegate.sectionName.getOrElse("global")
  override lazy val description = delegate.description
  lazy val twitterHandle: Option[String] = delegate.twitterHandle
  lazy val emailAddress: Option[String] = delegate.emailAddress

  override lazy val url: String = SupportedUrl(delegate)

  lazy val openGraphDescription: Option[String] = if (bio.nonEmpty) Some(bio) else description

  lazy val contributorLargeImagePath: Option[String] = delegate.bylineLargeImageUrl

  lazy val isContributor: Boolean = id.startsWith("profile/")
  lazy val bio: String = delegate.bio.getOrElse("")
  lazy val isSeries: Boolean = tagType == "series"
  lazy val isBlog: Boolean = tagType == "blog"

  override lazy val isFront = true

  lazy val showSeriesInMeta = id != "childrens-books-site/childrens-books-site"

  lazy val isKeyword = tagType == "keyword"

  override lazy val tags = Seq(this)

  lazy val tagWithoutSection = id.split("/")(1) // used for football nav

  lazy val richLinkId: Option[String] =
    delegate.references.find(_.`type` == "rich-link")
      .map(_.id.stripPrefix("rich-link/"))
      .filter(_.matches("""https?://www\.theguardian\.com/.*"""))

  lazy val openModuleId: Option[String] =
    delegate.references.find(_.`type` == "open-module")
      .map(_.id.stripPrefix("open-module/"))
      .filter(_.matches("""https?://open-module\.appspot\.com/view\?id=\d+"""))

  override lazy val analyticsName = s"GFE:$section:$name"

  override lazy val rssPath = Some(s"/$id/rss")

  lazy val podcast: Option[Podcast] = delegate.podcast

  private def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
    o.map(value => Map(key -> value)).getOrElse(Map())

  override def iosType = Some("list")

}
