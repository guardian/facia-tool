package services

import com.gu.facia.api.models.CollectionConfig
import com.gu.facia.api.utils.{CartoonKicker, ReviewKicker, TagKicker}
import common.Edition
import conf.Switches
import contentapi.Paths
import layout._
import model._
import org.joda.time.{DateTimeZone, DateTime}
import play.api.mvc.RequestHeader
import slices.{ContainerDefinition, Fixed, FixedContainers}

import scala.Function.const
import scalaz.std.list._
import scalaz.syntax.std.boolean._
import scalaz.syntax.traverse._

object IndexPagePagination {
  def pageSize: Int = if (Switches.TagPageSizeSwitch.isSwitchedOn) {
    35
  } else {
    20
  }

  def rssPageSize: Int = 20
}

case class MpuState(injected: Boolean)

object IndexPage {
  def fastContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] = numberOfItems match {
    case 2 => Some(FixedContainers.fastIndexPageMpuII)
    case 4 => Some(FixedContainers.fastIndexPageMpuIV)
    case 6 => Some(FixedContainers.fastIndexPageMpuVI)
    case n if n >= 9 => Some(FixedContainers.fastIndexPageMpuIX)
    case _ => None
  }

  def slowContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] = numberOfItems match {
    case 2 => Some(FixedContainers.slowIndexPageMpuII)
    case 4 => Some(FixedContainers.slowIndexPageMpuIV)
    case 5 => Some(FixedContainers.slowIndexPageMpuV)
    case 7 => Some(FixedContainers.slowIndexPageMpuVII)
    case _ => None
  }

  def makeFront(indexPage: IndexPage, edition: Edition) = {
    val isCartoonPage = indexPage.isTagWithId("type/cartoon")
    val isReviewPage = indexPage.isTagWithId("tone/reviews")

    val isSlow = SlowOrFastByTrails.isSlow(indexPage.trails)

    val grouped = if (isSlow || indexPage.forcesDayView)
      IndexPageGrouping.byDay(indexPage.trails, edition.timezone)
    else
      IndexPageGrouping.fromContent(indexPage.trails, edition.timezone)

    val containerDefinitions = grouped.toList.mapAccumL(MpuState(injected = false)) {
      case (mpuState, grouping) =>
        val collection = CollectionEssentials.fromFaciaContent(
          grouping.items.map(FaciaContentConvert.frontendContentToFaciaContent)
        )

        val mpuContainer = (if (isSlow)
          slowContainerWithMpu(grouping.items.length)
        else
          fastContainerWithMpu(grouping.items.length)).filter(const(!mpuState.injected))

        val (container, newMpuState) = mpuContainer map { mpuContainer =>
          (mpuContainer, mpuState.copy(injected = true))
        } getOrElse {
          val containerDefinition = if (isSlow) {
            ContainerDefinition.slowForNumberOfItems(grouping.items.length)
          } else {
            ContainerDefinition.fastForNumberOfItems(grouping.items.length)
          }

          (containerDefinition, mpuState)
        }

        val containerConfig = ContainerDisplayConfig(
          CollectionConfigWithId(grouping.dateHeadline.displayString, CollectionConfig.empty.copy(
            displayName = Some(grouping.dateHeadline.displayString)
          )),
          showSeriesAndBlogKickers = true
        )

        (newMpuState, ((containerConfig, collection), Fixed(container)))
    }._2.toSeq

    val headers = grouped.map(_.dateHeadline).zipWithIndex map { case (headline, index) =>
      if (index == 0) {
        indexPage.page match {
          case tag: Tag => FaciaContainerHeader.fromTagPage(tag, headline)
          case section: Section => FaciaContainerHeader.fromSection(section, headline)
          case page: Page => FaciaContainerHeader.fromPage(page, headline)
          case _ =>
            // should never happen
            LoneDateHeadline(headline)
        }
      } else {
        LoneDateHeadline(headline)
      }
    }
  }

}

case class IndexPage(page: MetaData, trails: Seq[Content],
                     date: DateTime = DateTime.now,
                     tzOverride: Option[DateTimeZone] = None) {
  private def isSectionKeyword(sectionId: String, id: String) = Set(
    Some(s"$sectionId/$sectionId"),
    Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" }
  ).flatten contains id

  def isTagWithId(id: String) = page match {
    case section: Section =>
      isSectionKeyword(section.id, id)

    case tag: Tag => tag.id == id

    case combiner: TagCombiner =>
      combiner.leftTag.id == id || combiner.rightTag.id == id

    case _ => false
  }

  def isFootballTeam = page match {
    case tag: Tag => tag.isFootballTeam
    case _ => false
  }

  def forcesDayView = page match {
    case tag: Tag if tag.section == "crosswords" => false
    case tag: Tag => Set("series", "blog").contains(tag.tagType)
    case _ => false
  }

  def idWithoutEdition = page match {
    case section: Section if section.isEditionalised => Paths.stripEditionIfPresent(section.id)
    case other => other.id
  }

  def allPath = s"/$idWithoutEdition"

}
