package services.editions

import java.time.LocalDate

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import fixtures.TestEdition
import model.editions.{ArticleMetadata, Edition, Image, MediaType, OphanQueryPrefillParams, TimeWindowConfigInDays}
import org.scalatest.{EitherValues, FreeSpec, Matchers, OptionValues}
import services.editions.prefills.{Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan, OphanScore}

import scala.concurrent.Future

class EditionsTemplatingTest extends FreeSpec with Matchers with OptionValues with EitherValues {

  val allFalseMetadata = ResolvedMetaData(false, false, false, false, false, false, false, false, false, false, false, false, false, false)
  val imageUrl = "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif"

  private val nullOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(None)
  }

  private val forwardOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(Some(
      Array(
        OphanScore("webUrl123456", 3d),
        OphanScore("webUrl345678", 2d),
        OphanScore("webUrl574893", 1d)
      )
    ))
  }

  val reverseOphan = new Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = Future.successful(Some(
      Array(
        OphanScore("webUrl123456", 1d),
        OphanScore("webUrl345678", 2d),
        OphanScore("webUrl574893", 3d)
      )
    ))
  }

  val fakeCapi = new Capi {
    def getPreviewHeaders(headers: Map[String, String], url: String): Seq[(String, String)] = ???

    def getUnsortedPrefillArticleItems(prefillParams: PrefillParamsAdapter): Future[List[Prefill]] = {
      import prefillParams._
      capiPrefillQuery.queryString match {
        case "?tag=theguardian/mainsection/topstories" => Future.successful(List(
          Prefill(
            123456,
            None,
            "webUrl123456",
            allFalseMetadata.copy(
              showByline = false,
              showQuotedHeadline = false,
              imageCutoutReplace = false
            ),
            None,
            "tone1",
            None,
            None,
            None)
        ))
        case "?tag=theguardian/g2/arts" => Future.successful(List(
          Prefill(
            345678,
            None,
            "webUrl345678",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            Some(Image(None, None, imageUrl, imageUrl)),
            "tone1",
            Some(MediaType.Cutout),
            None,
            None),
          Prefill(
            574893,
            None,
            "webUrl574893",
            allFalseMetadata.copy(
              showByline = true,
              showQuotedHeadline = true,
              imageCutoutReplace = true
            ),
            None,
            "tone2",
            Some(MediaType.UseArticleTrail),
            None,
            None)
        ))
      }
    }

    def getPrefillArticles(prefillParams: PrefillParamsAdapter, currentPageCodes: List[String]): Future[SearchResponse] = ???
  }

  "Creating a template" - {
    "Sets the prefill metadata from CAPI for Culture 1, with no ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issue = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2019, 9, 30)).right.value

      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts1 = arts.items.head
      arts1.pageCode shouldBe "345678"

      arts1.metadata.showByline.isDefined shouldBe true
      arts1.metadata.showByline.value shouldBe true

      arts1.metadata.showQuotedHeadline.isDefined shouldBe true
      arts1.metadata.showQuotedHeadline.value shouldBe true

      arts1.metadata.mediaType.isDefined shouldBe true
      arts1.metadata.mediaType.value shouldBe MediaType.Cutout

      arts1.metadata.cutoutImage.isDefined shouldBe true
      arts1.metadata.cutoutImage.value shouldBe
        Image(None, None, "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif", "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif")

    }


    "Sets the prefill metadata from CAPI for Culture 1, with reverse ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, reverseOphan)
      val issue = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2019, 9, 30)).right.value
      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts1 = arts.items.head
      arts1.pageCode shouldBe "574893"

    }


    "Sets the prefill metadata from CAPI for Culture 1, with forward ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, forwardOphan)
      val issue = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2019, 9, 30)).right.value
      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts1 = arts.items.head
      arts1.pageCode shouldBe "345678"

    }


    "Sets the prefill metadata from CAPI for Culture 2" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issue = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2019, 9, 30)).right.value
      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts2 = arts.items.tail.head
      arts2.pageCode shouldBe "574893"

      arts2.metadata.showByline.isDefined shouldBe true
      arts2.metadata.showByline.value shouldBe true

      arts2.metadata.showQuotedHeadline.isDefined shouldBe true
      arts2.metadata.showQuotedHeadline.value shouldBe true

      arts2.metadata.mediaType.isDefined shouldBe true
      arts2.metadata.mediaType.value shouldBe MediaType.UseArticleTrail

      arts2.metadata.cutoutImage shouldBe None

    }

    "Sets the prefill metadata from CAPI for UK News" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issue = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2019, 9, 30)).right.value
      issue.fronts.size shouldBe 4
      val frontPage = issue.fronts.find(_.name == "UK News").value.collections.find(_.name == "Front Page").value
      frontPage.items.size shouldBe 1
      frontPage.items.head.pageCode shouldBe "123456"
      frontPage.items.head.metadata shouldBe ArticleMetadata.default
    }
  }
}
