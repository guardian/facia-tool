package services.editions

import com.gu.contentapi.client.model.v1.SearchResponse
import com.gu.facia.api.utils.ResolvedMetaData
import fixtures.{FakeCapiAndOphan, TestEdition}
import model.editions._
import org.scalatest.{EitherValues, FreeSpec, Matchers, OptionValues}
import services.editions.prefills.{
  CapiQueryTimeWindow,
  Prefill,
  PrefillParamsAdapter
}
import services.{Capi, Ophan, OphanScore}

import java.time.{LocalDate, ZoneId, ZoneOffset}
import scala.concurrent.Future

class EditionsTemplatingTest
    extends FreeSpec
    with Matchers
    with OptionValues
    with EitherValues
    with FakeCapiAndOphan {

  "defineTimeWindow for contentPrefill" - {
    "should return expected time window" in {
      val timeWindowCfg =
        CapiTimeWindowConfigInDays(startOffset = -1, endOffset = 2)
      timeWindowCfg.toCapiQueryTimeWindow(
        LocalDate.of(2019, 10, 5)
      ) shouldEqual CapiQueryTimeWindow(
        LocalDate.of(2019, 10, 4).atStartOfDay().toInstant(ZoneOffset.UTC),
        LocalDate.of(2019, 10, 7).atStartOfDay().toInstant(ZoneOffset.UTC)
      )
    }
  }

  import TestEdition.{CapiQueryEndOffsetInDays, CapiQueryStartOffsetInDays}

  "Creating a template" - {
    "Sets the prefill from CAPI with collections cap" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4

      val cultureFronts = issue.fronts.find(_.name == "Culture").value
      val ukNewsFronts = issue.fronts.find(_.name == "UK News").value
      val topStoriesFronts = issue.fronts.find(_.name == "Top Stories").value
      val special2Fronts = issue.fronts.find(_.name == "Special 2").value

      val cultureFrontsCollectionsArticlesCountByName =
        toArticleItemsCountByCollectionName(cultureFronts.collections)
      val ukNewsFrontsCollectionsArticlesCountByName =
        toArticleItemsCountByCollectionName(ukNewsFronts.collections)
      val topStoriesFrontsCollectionsArticlesCountByName =
        toArticleItemsCountByCollectionName(topStoriesFronts.collections)
      val special2FrontsCollectionsArticlesCountByName =
        toArticleItemsCountByCollectionName(special2Fronts.collections)

      cultureFrontsCollectionsArticlesCountByName shouldBe Map(
        "Arts" -> 2,
        "TV & Radio" -> 0
      )

      ukNewsFrontsCollectionsArticlesCountByName shouldBe Map(
        "Weather" -> 0,
        "Front Page" -> 1,
        "UK News" -> 0
      )

      topStoriesFrontsCollectionsArticlesCountByName shouldBe Map(
        "Top Stories" -> 1,
        "Top Stories 2" -> 0
      )

      special2FrontsCollectionsArticlesCountByName shouldBe Map("Special" -> 4)
    }

    def toArticleItemsCountByCollectionName(
        collections: List[EditionsCollectionSkeleton]
    ): Map[String, Int] = {
      collections.groupBy(_.name).map { case (k, v) =>
        k -> v.flatMap(_.items).size
      }
    }

    "Sets the prefill metadata from CAPI for Culture Front, with no ordering" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts
        .find(_.name == "Culture")
        .value
        .collections
        .find(_.name == "Arts")
        .value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
      arts1.id shouldBe "345678"

      val metadata = arts1.metadata match {
        case Some(
              metadata @ EditionsArticleMetadata(
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _
              )
            ) =>
          metadata
        case _ => fail("Metadata is of incorrect type")
      }

      metadata.showByline.isDefined shouldBe true
      metadata.showByline.value shouldBe true

      metadata.showQuotedHeadline.isDefined shouldBe true
      metadata.showQuotedHeadline.value shouldBe true

      metadata.mediaType.isDefined shouldBe true
      metadata.mediaType.value shouldBe MediaType.Cutout

      metadata.cutoutImage.isDefined shouldBe true
      metadata.cutoutImage.value shouldBe
        Image(
          None,
          None,
          "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif",
          "https://media.giphy.com/media/K3PYNk8oh3HGM/source.gif"
        )

    }

    "Sets the prefill metadata from CAPI for Culture Front, with reverse ordering" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, reverseOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts
        .find(_.name == "Culture")
        .value
        .collections
        .find(_.name == "Arts")
        .value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
      arts1.id shouldBe "574893"

    }

    "Sets the prefill metadata from CAPI for Culture Front, with forward ordering" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, forwardOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts
        .find(_.name == "Culture")
        .value
        .collections
        .find(_.name == "Arts")
        .value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
      arts1.id shouldBe "345678"

    }

    "Sets the prefill metadata from CAPI for Culture Front" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts
        .find(_.name == "Culture")
        .value
        .collections
        .find(_.name == "Arts")
        .value
      artsCollection.items.size shouldBe 2

      val arts2 = artsCollection.items.tail.head
      arts2.id shouldBe "574893"

      val metadata = arts2.metadata match {
        case Some(
              metadata @ EditionsArticleMetadata(
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _,
                _
              )
            ) =>
          metadata
        case _ => fail("Metadata is of incorrect type")
      }

      metadata.showByline.isDefined shouldBe true
      metadata.showByline.value shouldBe true

      metadata.showQuotedHeadline.isDefined shouldBe true
      metadata.showQuotedHeadline.value shouldBe true

      metadata.mediaType.isDefined shouldBe true
      metadata.mediaType.value shouldBe MediaType.UseArticleTrail

      metadata.cutoutImage shouldBe None

    }

    "Sets the prefill metadata from CAPI for UK News Front" in {
      val templating =
        new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating
        .generateEditionTemplate(Edition.TrainingEdition, issueDate)
        .toOption
        .get
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(
          issueDate.plusDays(CapiQueryStartOffsetInDays)
        ),
        toDate =
          issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val frontPageCollection = issue.fronts
        .find(_.name == "UK News")
        .value
        .collections
        .find(_.name == "Front Page")
        .value
      frontPageCollection.items.size shouldBe 1
      frontPageCollection.items.head.id shouldBe "123456"
      frontPageCollection.items.head.metadata shouldBe Some(
        EditionsArticleMetadata.default
      )
    }
  }

  "Build issue skeleton" - {
    "Issue date range is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.toOption.get.contentPrefillTimeWindow shouldBe (
        CapiQueryTimeWindow(
          LocalDate.of(2019, 12, 31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
      )
    }

    "Issue date is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.toOption.get.issueSkeleton.issueDate shouldBe (LocalDate
        .of(2020, 1, 1))
    }

    "Issue zone is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.toOption.get.issueSkeleton.zoneId shouldBe (ZoneId.of(
        "Europe/London"
      ))
    }

    "Issue fronts list is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.toOption.get.issueSkeleton.fronts.size shouldBe (4) // No Saturday section on a Wednesday.
    }

    "Issue first front content with no time window override is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      val front = editionSkeleton.toOption.get.issueSkeleton.fronts(0)
      front.collections(0).capiQueryTimeWindow shouldBe (
        // This collection has a different time window than that of the main edition template
        CapiQueryTimeWindow(
          LocalDate.of(2019, 12, 31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
      )
    }

    "Issue first front content with different time window is correct" in {
      val editionSkeleton =
        new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
          .generateEditionTemplate(
            Edition.TrainingEdition,
            LocalDate.of(2020, 1, 1)
          )
      editionSkeleton.isRight shouldBe (true)
      val front = editionSkeleton.toOption.get.issueSkeleton.fronts(0)
      front.collections(1).capiQueryTimeWindow shouldBe (
        // This collection has a different time window than that of the main edition template
        CapiQueryTimeWindow(
          LocalDate.of(2019, 12, 29).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
      )
    }
  }

  object TestCapi extends Capi {
    override def getPreviewHeaders(
        headers: Map[String, String],
        url: String
    ): Seq[(String, String)] = Seq.empty[(String, String)]

    override def getPrefillArticles(
        prefillParams: PrefillParamsAdapter,
        currentPageCodes: List[String]
    ): List[SearchResponse] = Nil

    override def getUnsortedPrefillArticleItems(
        prefillParams: PrefillParamsAdapter
    ): List[Prefill] = Nil
  }

  object TestOphan extends Ophan {
    override def getOphanScores(
        maybeUrl: Option[String],
        baseDate: LocalDate,
        maybeOphanQueryPrefillParams: Option[OphanQueryPrefillParams]
    ): Future[Option[Array[OphanScore]]] = ???
  }

  val templating =
    new EditionsTemplating(TestEdition.templates, TestCapi, TestOphan)

  "createEdition" - {
    "should return Monday's content for Monday" in {
      val editionTemplate = templating.generateEditionTemplate(
        Edition.TrainingEdition,
        LocalDate.parse("2019-03-11")
      )
      val editionTemplateFronts =
        editionTemplate.toOption.get.issueSkeleton.fronts
      editionTemplateFronts.length should be(4)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq(
        "Top Stories",
        "UK News",
        "Culture",
        "Special 2"
      )
    }

    "should return Friday's content for Friday" in {
      val editionTemplateFronts = templating
        .generateEditionTemplate(
          Edition.TrainingEdition,
          LocalDate.parse("2019-03-15")
        )
        .toOption
        .get
        .issueSkeleton
        .fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq(
        "Top Stories",
        "UK News",
        "Special 2"
      )
    }

    "should return Saturday's content for Saturday" in {
      val editionTemplateFronts = templating
        .generateEditionTemplate(
          Edition.TrainingEdition,
          LocalDate.parse("2019-03-16")
        )
        .toOption
        .get
        .issueSkeleton
        .fronts
      editionTemplateFronts.length should be(3)
      editionTemplateFronts.map(_.name) should contain theSameElementsAs Seq(
        "Top Stories",
        "UK News",
        "Special 2"
      )
    }

    "should order prefills by ophan promotion score and docorate them with promotions scores if this data is available" in {
      val a = prefillWithCapiId("capi123")
      val b = prefillWithCapiId("capi456")
      val c = prefillWithCapiId("capi789")

      val prefilled = Seq(a, b, c).toList
      val ophanScores: Map[String, Double] = Map(
        a.capiId -> 0,
        b.capiId -> 45.3,
        c.capiId -> 100.0
      )
      val collectionTemplatingHelper =
        new CollectionTemplatingHelper(TestCapi, TestOphan)

      val sortedPrefills = collectionTemplatingHelper.sortArticleItems(
        prefilled,
        Some(ophanScores)
      )

      sortedPrefills.size shouldBe prefilled.size // No content was lost in this sorting
      sortedPrefills.head.capiId shouldBe c.capiId // The most promoted item has been sorted to the top
      sortedPrefills.last.capiId shouldBe a.capiId

      sortedPrefills.head.promotionMetric shouldBe Some(
        100.0
      ) // The item has been decorated with a promotion score
    }
  }

  private def prefillWithCapiId(capiId: String): Prefill = {
    val allFalseMetadata = ResolvedMetaData(
      false,
      false,
      "boostLevel.default",
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    )
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
      capiId
    )
  }

  private def issueDateToUTCStartOfDay(issueDate: LocalDate) =
    issueDate.atStartOfDay().toInstant(ZoneOffset.UTC)

}
