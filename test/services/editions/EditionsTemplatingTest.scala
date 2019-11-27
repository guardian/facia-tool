package services.editions

import java.time.{LocalDate, ZoneId, ZoneOffset}

import fixtures.{FakeCapiAndOphan, TestEdition}
import model.editions._
import org.scalatest.{EitherValues, FreeSpec, Matchers, OptionValues}
import services.editions.prefills.CapiQueryTimeWindow

class EditionsTemplatingTest extends FreeSpec with Matchers with OptionValues with EitherValues with FakeCapiAndOphan {

  "defineTimeWindow for contentPrefill" - {
    "should return expected time window" in {
      val timeWindowCfg = CapiTimeWindowConfigInDays(startOffset = -1, endOffset = 2)
      timeWindowCfg.toCapiQueryTimeWindow(LocalDate.of(2019, 10, 5)) shouldEqual CapiQueryTimeWindow(
        LocalDate.of(2019, 10, 4).atStartOfDay().toInstant(ZoneOffset.UTC),
        LocalDate.of(2019, 10, 7).atStartOfDay().toInstant(ZoneOffset.UTC)
      )
    }
  }

  import TestEdition.{CapiQueryEndOffsetInDays, CapiQueryStartOffsetInDays}

  "Creating a template" - {
    "Sets the prefill from CAPI with collections cap" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4

      val cultureFronts = issue.fronts.find(_.name == "Culture").value
      val ukNewsFronts = issue.fronts.find(_.name == "UK News").value
      val topStoriesFronts = issue.fronts.find(_.name == "Top Stories").value
      val special2Fronts = issue.fronts.find(_.name == "Special 2").value

      val cultureFrontsCollectionsArticlesCountByName = toArticleItemsCountByCollectionName(cultureFronts.collections)
      val ukNewsFrontsCollectionsArticlesCountByName = toArticleItemsCountByCollectionName(ukNewsFronts.collections)
      val topStoriesFrontsCollectionsArticlesCountByName = toArticleItemsCountByCollectionName(topStoriesFronts.collections)
      val special2FrontsCollectionsArticlesCountByName = toArticleItemsCountByCollectionName(special2Fronts.collections)

      cultureFrontsCollectionsArticlesCountByName shouldBe Map("Arts" -> 2, "TV & Radio" -> 0)

      ukNewsFrontsCollectionsArticlesCountByName shouldBe Map("Weather" -> 0, "Front Page" -> 1, "UK News" -> 0)

      topStoriesFrontsCollectionsArticlesCountByName shouldBe Map("Top Stories" -> 1, "Top Stories 2" -> 0)

      special2FrontsCollectionsArticlesCountByName shouldBe Map("Special" -> 4)
    }

    def toArticleItemsCountByCollectionName(collections: List[EditionsCollectionSkeleton]): Map[String, Int] = {
      collections.groupBy(_.name).map{
        case (k, v) =>
          k -> v.flatMap(_.items).size
      }
    }

    "Sets the prefill metadata from CAPI for Culture Front, with no ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
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


    "Sets the prefill metadata from CAPI for Culture Front, with reverse ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, reverseOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
      arts1.pageCode shouldBe "574893"

    }


    "Sets the prefill metadata from CAPI for Culture Front, with forward ordering" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, forwardOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      artsCollection.items.size shouldBe 2

      val arts1 = artsCollection.items.head
      arts1.pageCode shouldBe "345678"

    }


    "Sets the prefill metadata from CAPI for Culture Front" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val artsCollection = issue.fronts.find(_.name == "Culture").value.collections.find(_.name == "Arts").value
      artsCollection.items.size shouldBe 2

      val arts2 = artsCollection.items.tail.head
      arts2.pageCode shouldBe "574893"

      arts2.metadata.showByline.isDefined shouldBe true
      arts2.metadata.showByline.value shouldBe true

      arts2.metadata.showQuotedHeadline.isDefined shouldBe true
      arts2.metadata.showQuotedHeadline.value shouldBe true

      arts2.metadata.mediaType.isDefined shouldBe true
      arts2.metadata.mediaType.value shouldBe MediaType.UseArticleTrail

      arts2.metadata.cutoutImage shouldBe None

    }

    "Sets the prefill metadata from CAPI for UK News Front" in {
      val templating = new EditionsTemplating(TestEdition.templates, fakeCapi, nullOphan)
      val issueDate = LocalDate.of(2019, 9, 30)
      val genTemplateResult = templating.generateEditionTemplate(Edition.TrainingEdition, issueDate).right.value
      val issue = genTemplateResult.issueSkeleton

      genTemplateResult.contentPrefillTimeWindow shouldEqual CapiQueryTimeWindow(
        fromDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryStartOffsetInDays)),
        toDate = issueDateToUTCStartOfDay(issueDate.plusDays(CapiQueryEndOffsetInDays))
      )

      issue.fronts.size shouldBe 4
      val frontPageCollection = issue.fronts.find(_.name == "UK News").value.collections.find(_.name == "Front Page").value
      frontPageCollection.items.size shouldBe 1
      frontPageCollection.items.head.pageCode shouldBe "123456"
      frontPageCollection.items.head.metadata shouldBe ArticleMetadata.default
    }
  }

  "Build issue skeleton" - {
    "Issue date range is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.contentPrefillTimeWindow shouldBe (
        CapiQueryTimeWindow(
          LocalDate.of(2019, 12, 31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC))
        )
    }

    "Issue date is correct" in {
      val editionSkeleton = new EditionsTemplating(TestEdition.templates, fakeCapi, fakeOphan)
        .generateEditionTemplate(Edition.TrainingEdition, LocalDate.of(2020, 1, 1))
      editionSkeleton.isRight shouldBe (true)
      editionSkeleton.right.get.issueSkeleton.issueDate shouldBe (LocalDate.of(2020, 1, 1))
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
          LocalDate.of(2019, 12, 31).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
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
          LocalDate.of(2019, 12, 29).atStartOfDay.toInstant(ZoneOffset.UTC),
          LocalDate.of(2020, 1, 3).atStartOfDay.toInstant(ZoneOffset.UTC)
        )
        )
    }
  }

  private def issueDateToUTCStartOfDay(issueDate: LocalDate) = issueDate.atStartOfDay().toInstant(ZoneOffset.UTC)

}
