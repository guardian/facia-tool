package services.editions

import java.time.{LocalDate, ZonedDateTime}

import com.gu.contentapi.client.model.v1.SearchResponse
import fixtures.TestEdition
import model.editions.{ArticleMetadata, CapiPrefillQuery, EditionsArticleSkeleton, Image, MediaType}
import org.scalatest.{FreeSpec, Matchers, OptionValues}
import services.{Capi, PrefillMetadata}

import scala.concurrent.Future

class EditionsTemplatingTest extends FreeSpec with Matchers with OptionValues {
  "Creating a template" - {
    "Sets the prefill metadata from CAPI" in {
      val fakeCapi = new Capi {
        def getPreviewHeaders(url: String): Seq[(String, String)] = ???
        def getPrefillArticleItems(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery): Future[List[(String, PrefillMetadata)]] = {
          capiPrefillQuery.queryString match {
            case "?tag=theguardian/mainsection/topstories" => Future.successful(List(
              "123456" -> PrefillMetadata(false, false, false, None)
            ))
            case "?tag=theguardian/g2/arts" => Future.successful(List(
              "345678" -> PrefillMetadata(true, true, true, Some("https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif")),
              "574893" -> PrefillMetadata(true, true, true, None),
            ))
          }
        }
        def getPrefillArticles(issueDate: ZonedDateTime, capiPrefillQuery: CapiPrefillQuery, currentPageCodes: List[String]): Future[SearchResponse] = ???
      }
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi)
      val issue = templating.generateEditionTemplate("test-edition", LocalDate.of(2019, 9, 30)).value
      issue.fronts.size shouldBe 4
      val frontPage = issue.fronts.find(_.name == "UK News").value.collections.find(_.name == "Front Page").value
      frontPage.items.size shouldBe 1
      frontPage.items.head.pageCode shouldBe "123456"
      frontPage.items.head.metadata shouldBe ArticleMetadata.default
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2
      val arts1 = arts.items.head
      arts1.pageCode shouldBe "345678"
      arts1.metadata.showByline.value shouldBe true
      arts1.metadata.showQuotedHeadline.value shouldBe true
      arts1.metadata.mediaType.value shouldBe MediaType.Cutout
      arts1.metadata.cutoutImage.value shouldBe
        Image(None, None, "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif", "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif")
      val arts2 = arts.items.tail.head
      arts2.pageCode shouldBe "574893"
      arts2.metadata.showByline.value shouldBe true
      arts2.metadata.showQuotedHeadline.value shouldBe true
      arts2.metadata.mediaType.value shouldBe MediaType.UseArticleTrail
      arts2.metadata.cutoutImage shouldBe None
    }
  }
}
