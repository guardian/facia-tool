package services.editions

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import fixtures.TestEdition
import model.editions.{Edition, OphanQueryPrefillParams}
import org.scalatest.MustMatchers.convertToAnyMustWrapper
import org.scalatest.{FreeSpec, Matchers}
import services.editions.prefills.{Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan, OphanScore}

import java.time.LocalDate
import scala.concurrent.Future

class EditionsTemplatingTooTest extends FreeSpec with Matchers {

  object TestCapi extends Capi {
    override def getPreviewHeaders(headers: Map[String, String], url: String): Seq[(String, String)] = Seq.empty[(String, String)]

    override def getPrefillArticles(prefillParams: PrefillParamsAdapter, currentPageCodes: List[String]): List[SearchResponse] = Nil

    override def getUnsortedPrefillArticleItems(prefillParams: PrefillParamsAdapter): List[Prefill] = Nil
  }

  object TestOphan extends Ophan {
    override def getOphanScores(maybeUrl: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] = ???
  }

  val templating = new EditionsTemplating(TestEdition.templates, TestCapi, TestOphan)

  "createEdition" - {
    "should return Monday's content for Monday" in {
      val editionTemplate = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.parse("2019-03-11"))
      val editionTemplateFronts = editionTemplate.toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(4)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Culture", "Special 2")
    }

    "should return Friday's content for Friday" in {
      val editionTemplateFronts = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.parse("2019-03-15")).toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Special 2")
    }

    "should return Saturday's content for Saturday" in {
      val editionTemplateFronts = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.parse("2019-03-16")).toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Special 2")
    }

    "should order prefills by ophan promotion score and docorate them with promotions scores if this data is available" in {
      val a = prefillWithCapiId("capi123")
      val b = prefillWithCapiId("capi456")
      val c = prefillWithCapiId("capi789")

      val prefilled = Seq(a, b, c).toList
      val ophanScores: Map[String, Double] = Map(
        a.capiId -> 0,
        b.capiId -> 45.3,
        c.capiId -> 100.0,
      )
      val collectionTemplatingHelper = new CollectionTemplatingHelper(TestCapi, TestOphan)

      val sortedPrefills = collectionTemplatingHelper.sortArticleItems(prefilled, Some(ophanScores))

      sortedPrefills.size mustBe prefilled.size // No content was lost in this sorting
      sortedPrefills.head.capiId mustBe c.capiId // The most promoted item has been sorted to the top
      sortedPrefills.last.capiId mustBe a.capiId

      sortedPrefills.head.promotionMetric mustBe Some(100.0)  // The item has been decorated with a promotion score
    }
  }

  private def prefillWithCapiId(capiId: String): Prefill = {
    val allFalseMetadata = ResolvedMetaData(false, false, false, false, false, false, false, false, false, false, false, false, false, false)
    Prefill(
      222222,
      None,
      "webUrlFor" + capiId,
      allFalseMetadata,
      None,
      "tone2",
      None,
      None,
      None,
      capiId,
    )
  }

}
