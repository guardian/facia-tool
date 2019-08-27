package services

import com.gu.contentapi.client.model.v1.{Atoms, Blocks, CapiDateTime, Content, ContentFields, ContentStats, ContentType, Crossword, Debug, Element, MembershipTier, Office, Podcast, Reference, Rights, Section, Sponsorship, Tag, TagType}
import org.scalatest.{FreeSpec, Matchers}

class CapiTest extends FreeSpec with Matchers {

  val testInternalPageCode = 1
  val testWebTitle = "test1"
  val testWebUrl = "test2"
  val testApiUrl = "test3"

  "prefill" - {
    case class DumbContentFieldsObject(val internalPageCode: Option[Int]) extends ContentFields {
      override def headline: Option[String] = ???
      override def standfirst: Option[String] = ???
      override def trailText: Option[String] = ???
      override def byline: Option[String] = ???
      override def main: Option[String] = ???
      override def body: Option[String] = ???
      override def newspaperPageNumber: Option[Int] = ???
      override def starRating: Option[Int] = ???
      override def contributorBio: Option[String] = ???
      override def membershipAccess: Option[MembershipTier] = ???
      override def wordcount: Option[Int] = ???
      override def commentCloseDate: Option[CapiDateTime] = ???
      override def commentable: Option[Boolean] = ???
      override def creationDate: Option[CapiDateTime] = ???
      override def displayHint: Option[String] = ???
      override def firstPublicationDate: Option[CapiDateTime] = ???
      override def hasStoryPackage: Option[Boolean] = ???
      override def internalComposerCode: Option[String] = ???
      override def internalOctopusCode: Option[String] = ???
      override def internalStoryPackageCode: Option[Int] = ???
      override def isInappropriateForSponsorship: Option[Boolean] = ???
      override def isPremoderated: Option[Boolean] = ???
      override def lastModified: Option[CapiDateTime] = ???
      override def liveBloggingNow: Option[Boolean] = ???
      override def newspaperEditionDate: Option[CapiDateTime] = ???
      override def productionOffice: Option[Office] = ???
      override def publication: Option[String] = ???
      override def scheduledPublicationDate: Option[CapiDateTime] = ???
      override def secureThumbnail: Option[String] = ???
      override def shortUrl: Option[String] = ???
      override def shouldHideAdverts: Option[Boolean] = ???
      override def showInRelatedContent: Option[Boolean] = ???
      override def thumbnail: Option[String] = ???
      override def legallySensitive: Option[Boolean] = ???
      override def allowUgc: Option[Boolean] = ???
      override def sensitive: Option[Boolean] = ???
      override def lang: Option[String] = ???
      override def internalRevision: Option[Int] = ???
      override def internalContentCode: Option[Int] = ???
      override def isLive: Option[Boolean] = ???
      override def internalShortId: Option[String] = ???
      override def shortSocialShareText: Option[String] = ???
      override def socialShareText: Option[String] = ???
      override def bodyText: Option[String] = ???
      override def charCount: Option[Int] = ???
      override def internalVideoCode: Option[String] = ???
      override def shouldHideReaderRevenue: Option[Boolean] = ???
      override def internalCommissionedWordcount: Option[Int] = ???
      override def showAffiliateLinks: Option[Boolean] = ???
      override def bylineHtml: Option[String] = ???
    }

    case class DumbTagObject(val id: String, val `type`: TagType, val bylineLargeImageUrl: Option[String] = None) extends Tag {
      override def sectionId: Option[String] = ???
      override def sectionName: Option[String] = ???
      override def webTitle: String = testWebTitle
      override def webUrl: String = testWebUrl
      override def apiUrl: String = testApiUrl
      override def references: Seq[Reference] = ???
      override def description: Option[String] = ???
      override def bio: Option[String] = ???
      override def bylineImageUrl: Option[String] = ???
      override def podcast: Option[Podcast] = ???
      override def firstName: Option[String] = ???
      override def lastName: Option[String] = ???
      override def emailAddress: Option[String] = ???
      override def twitterHandle: Option[String] = ???
      override def activeSponsorships: Option[Seq[Sponsorship]] = ???
      override def paidContentType: Option[String] = ???
      override def paidContentCampaignColour: Option[String] = ???
      override def rcsId: Option[String] = ???
      override def r2ContributorId: Option[String] = ???
      override def tagCategories: Option[collection.Set[String]] = ???
      override def entityIds: Option[collection.Set[String]] = ???
      override def campaignInformationType: Option[String] = ???
      override def internalName: Option[String] = ???
    }

    case class DumbContentObject(val internalPageCode: Option[Int] = Some(testInternalPageCode), val tags: Seq[Tag] = List() ) extends Content {
      override def id: String = ???
      override def `type`: ContentType = ???
      override def sectionId: Option[String] = ???
      override def sectionName: Option[String] = ???
      override def webPublicationDate: Option[CapiDateTime] = ???
      override def webTitle: String = ???
      override def webUrl: String = ???
      override def apiUrl: String = ???
      override def fields: Option[ContentFields] = Some(new DumbContentFieldsObject(internalPageCode))
      override def elements: Option[Seq[Element]] = ???
      override def references: Seq[Reference] = ???
      override def isExpired: Option[Boolean] = ???
      override def blocks: Option[Blocks] = ???
      override def rights: Option[Rights] = ???
      override def crossword: Option[Crossword] = ???
      override def stats: Option[ContentStats] = ???
      override def section: Option[Section] = ???
      override def debug: Option[Debug] = ???
      override def isGone: Option[Boolean] = ???
      override def isHosted: Boolean = ???
      override def pillarId: Option[String] = ???
      override def pillarName: Option[String] = ???
      override def atoms: Option[Atoms] = ???
    }

    "no internal page code" in {
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(internalPageCode = None))
      result shouldBe None
    }

    "some internal page code" in {
      val result = GuardianCapi.prefillMetadata(new DumbContentObject())
      result should not be None
      result.get.internalPageCode shouldBe testInternalPageCode
    }

    "don't show" in {
      val tag = DumbTagObject(
        "tone/sarcastic",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag)))
      result should not be None
      result.get.showByline shouldBe false
      result.get.showQuotedHeadline shouldBe false
      result.get.imageCutoutReplace shouldBe false
      result.get.cutout shouldBe None
    }

    "comment showByline" in {
      val tag = DumbTagObject(
        "tone/comment",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag)))
      result should not be None
      result.get.showByline shouldBe true
    }

    "cartoon showByline" in {
      val tag = DumbTagObject(
        "type/cartoon",
        com.gu.contentapi.client.model.v1.TagType.Type)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag)))
      result should not be None
      result.get.showByline shouldBe true
    }

    "showQuotedHeadline" in {
      val tag = DumbTagObject(
        "tone/comment",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag)))
      result should not be None
      result.get.showQuotedHeadline shouldBe true
    }

    "imageCutoutReplace" in {
      val tag = DumbTagObject(
        "tone/comment",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag)))
      result should not be None
      result.get.imageCutoutReplace shouldBe true
    }

    "cutout present" in {
      val cutout = "cutout"
      val tag1 = DumbTagObject(
        "tone/comment",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val tag2 = DumbTagObject(
        "whatever",
        com.gu.contentapi.client.model.v1.TagType.Contributor,
        bylineLargeImageUrl = Some(cutout))
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag1, tag2)))
      result should not be None
      result.get.cutout should not be None
      result.get.cutout.get shouldBe cutout
    }

    "cutout not present" in {
      val cutout = "cutout"
      val tag1 = DumbTagObject(
        "tone/comment",
        com.gu.contentapi.client.model.v1.TagType.Tone)
      val result = GuardianCapi.prefillMetadata(new DumbContentObject(tags = List(tag1)))
      result should not be None
      result.get.cutout shouldBe None
    }

  }
}
