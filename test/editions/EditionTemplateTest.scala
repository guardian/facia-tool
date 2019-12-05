package services

import java.time.LocalDate

import com.gu.contentapi.client.model.v1.SearchResponse
import fixtures.TestEdition
import model.editions.{Edition, OphanQueryPrefillParams}
import org.scalatest.{FreeSpec, Matchers}
import services.editions.EditionsTemplating
import services.editions.prefills.{Prefill, PrefillParamsAdapter}

import scala.concurrent.Future

class EditionTemplateTest extends FreeSpec with Matchers {

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
      val editionTemplateFronts = editionTemplate.right.toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(4)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Culture", "Special 2")
    }

    "should return Friday's content for Friday" in {
      val editionTemplateFronts = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.parse("2019-03-15")).right.toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Special 2")
    }

    "should return Saturday's content for Saturday" in {
      val editionTemplateFronts = templating.generateEditionTemplate(Edition.TrainingEdition, LocalDate.parse("2019-03-16")).right.toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq("Top Stories", "UK News", "Special 2")
    }
  }
}
