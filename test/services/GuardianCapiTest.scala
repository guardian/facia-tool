package services

import java.time.LocalDate

import fixtures.TestEdition
import model.editions.{CapiPrefillQuery, Edition, PathType, UseDateQueryParamValue}
import org.scalatest.{FunSuite, Matchers}
import services.editions.EditionsTemplating
import services.editions.prefills.{CapiQueryTimeWindow, ContentPrefillTimeParams, MetadataForLogging, PrefillParamsAdapter}

class GuardianCapiTest extends FunSuite with Matchers {

  private val issueDate = LocalDate.of(2019, 10, 5)

  private val contentPrefillQuery = CapiPrefillQuery("?tag=theguardian/mainsection/topstories", PathType.PrintSent)

  private val timeWindowCfg = TestEdition.templates(Edition.TrainingEdition).capiQueryPrefillParams.timeWindowConfig

  private val contentPrefillTimeWindow: CapiQueryTimeWindow = EditionsTemplating.defineContentQueryTimeWindow(issueDate, timeWindowCfg)

  test("geneneratePrefillQuery") {

    val getPrefillParams = PrefillParamsAdapter(
      issueDate,
      contentPrefillQuery,
      ContentPrefillTimeParams(contentPrefillTimeWindow, UseDateQueryParamValue.Published),
      None, None,
      Edition.TrainingEdition,
      MetadataForLogging(LocalDate.now(),
        collectionId = None, collectionName = None)
    )

    val actual = GuardianCapi.prepareGetUnsortedPrefillArticleItemsQuery(getPrefillParams).getUrl("")

    val expected = "/content/print-sent" +
      "?order-by=newest" +
      "&page-size=200" +
      "&tag=theguardian%2Fmainsection%2Ftopstories" +
      "&to-date=2019-10-07T00%3A00%3A00Z" +
      "&page=1" +
      "&use-date=published" +
      "&show-fields=newspaperEditionDate%2CnewspaperPageNumber%2CinternalPageCode" +
      "&show-tags=all" +
      "&from-date=2019-10-04T00%3A00%3A00Z"

    actual shouldEqual expected
  }

  test("prepareGetPrefillArticlesQuery") {

    val currentPageCodes = List("123", "456")

    val getPrefillParams = PrefillParamsAdapter(
      issueDate,
      contentPrefillQuery,
      ContentPrefillTimeParams(contentPrefillTimeWindow, UseDateQueryParamValue.NewspaperEdition),
      None, None,
      Edition.TrainingEdition,
      MetadataForLogging(LocalDate.now(),
        collectionId = None, collectionName = None)
    )

    val actual = GuardianCapi.prepareGetPrefillArticlesQuery(getPrefillParams, currentPageCodes).getUrl("")

    actual shouldEqual "/content/print-sent" + "" +
      "?order-by=newest" +
      "&show-elements=images" +
      "&page-size=200" +
      "&tag=theguardian%2Fmainsection%2Ftopstories" +
      "&to-date=2019-10-07T00%3A00%3A00Z&page=1" +
      "&show-atoms=media" +
      "&use-date=newspaper-edition" +
      "&show-fields=newspaperEditionDate%2CnewspaperPapeNumber%2CinternalPageCode%2CisLive%2CfirstPublicationDate%2Cheadline%2CtrailText%2Cbyline%2Cthumbnail%2CsecureThumbnail%2CliveBloggingNow%2CmembershipAccess%2CshortUrl" +
      "&show-tags=all" +
      "&show-blocks=main" +
      "&from-date=2019-10-04T00%3A00%3A00Z"
  }

}
