package services.editions

import java.time.{LocalDate, ZoneId, ZoneOffset}

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import fixtures.TestEdition
import model.editions._
import org.scalatest.{EitherValues, FreeSpec, Matchers, OptionValues}
import services.editions.prefills.{CapiQueryTimeWindow, Prefill, PrefillParamsAdapter}
import services.{Capi, Ophan, OphanScore}
import java.time.temporal.ChronoField

import scala.concurrent.Future

class EditionsTemplatingTest extends FreeSpec with Matchers with OptionValues with EitherValues {

  // TODO add tests here

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

  val fakeOphan = new Ophan() {
    override def getOphanScores(maybePath: Option[String], baseDate: LocalDate, maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]): Future[Option[Array[OphanScore]]] =
      Future.successful(Some(Array(OphanScore("banana", 33d))))
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

  "defineTimeWindow for contentPrefill" - {
    "should return expected time window" in {
      val timeWindowCfg = CapiTimeWindowConfigInDays(startOffset = -1, endOffset = 2)
      timeWindowCfg.toCapiQueryTimeWindow(LocalDate.of(2019, 10, 5)) shouldEqual CapiQueryTimeWindow(
        LocalDate.of(2019, 10, 4).atStartOfDay().toInstant(ZoneOffset.UTC),
        LocalDate.of(2019, 10, 7).atStartOfDay().toInstant(ZoneOffset.UTC)
      )
    }
  }

  private def issueDateToUTCStartOfDay(issueDate: LocalDate) = issueDate.atStartOfDay().toInstant(ZoneOffset.UTC)

  import TestEdition.{ContentQueryEndOffsetInDays, ContentQueryStartOffsetInDays}

  "Creating a template" - {
    "Sets the prefill metadata from CAPI for Culture 1, with no ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryEndOffsetInDays))
      )

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
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts1 = arts.items.head
      arts1.pageCode shouldBe "574893"

    }


    "Sets the prefill metadata from CAPI for Culture 1, with forward ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, forwardOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val arts = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      arts.items.size shouldBe 2

      val arts1 = arts.items.head
      arts1.pageCode shouldBe "345678"

    }


    "Sets the prefill metadata from CAPI for Culture 2" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryEndOffsetInDays))
      )

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
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(ContentQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val frontPage = issue.fronts.find(_.name == "UK News").value.collections.find(_.name == "Front Page").value
      frontPage.items.size shouldBe 1
      frontPage.items.head.pageCode shouldBe "123456"
      frontPage.items.head.metadata shouldBe ArticleMetadata.default
    }
  }

  "Build issue skeleton" - {
    "Issue date range is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.contentPrefillTimeWindow shouldBe (
        CapiQueryTimeWindow(
          LocalDate.of(2019,12,31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020,1,3).atStartOfDay.toInstant(ZoneOffset.UTC))
        )
    }

    "Issue date is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.issueSkeleton.issueDate shouldBe (LocalDate.of(2020,1,1))
    }

    "Issue zone is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.issueSkeleton.zoneId shouldBe (ZoneId.of("Europe/London"))
    }

    "Issue fronts list is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.issueSkeleton.fronts.size shouldBe (4) // No Saturday section on a Wednesday.
    }

    "Issue first front content with no time window override is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      val front = editionSkeleton.right.get.issueSkeleton.fronts(0)
      front.collections(0).capiQueryTimeWindow shouldBe (
        // This collection has a different time window than that of the main edition template
        CapiQueryTimeWindow(
          LocalDate.of(2019,12,31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020,1,3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
      )
    }

    "Issue first front content with different time window is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      val front = editionSkeleton.right.get.issueSkeleton.fronts(0)
      front.collections(1).capiQueryTimeWindow shouldBe (
        // This collection has a different time window than that of the main edition template
        CapiQueryTimeWindow(
          LocalDate.of(2019,12,29).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020,1,3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
      )
    }
  }
}
