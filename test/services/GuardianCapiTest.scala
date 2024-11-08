package services

import java.time.{LocalDate, ZoneOffset}

import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import fixtures.TestEdition
import model.editions.{CapiDateQueryParam, CapiPrefillQuery, Edition, PathType}
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers}
import services.editions.prefills.{
  CapiPrefillTimeParams,
  CapiQueryTimeWindow,
  MetadataForLogging,
  PrefillParamsAdapter
}

import scala.concurrent.{ExecutionContext, Future}

class GuardianCapiTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  behavior of "geneneratePrefillQuery"

  private val issueDate = LocalDate.of(2019, 10, 5)

  private val contentPrefillQuery = CapiPrefillQuery(
    "?tag=theguardian/mainsection/topstories",
    PathType.PrintSent
  )

  private val timeWindowCfg = TestEdition.template.timeWindowConfig

  private val contentPrefillTimeWindow: CapiQueryTimeWindow =
    timeWindowCfg.toCapiQueryTimeWindow(issueDate)

  it should "prepare query to get ArticleItems for prefill on create issue request" in {

    val getPrefillParams = PrefillParamsAdapter(
      issueDate,
      contentPrefillQuery,
      CapiPrefillTimeParams(
        contentPrefillTimeWindow,
        CapiDateQueryParam.Published
      ),
      maybeOphanPath = None,
      maybeOphanQueryPrefillParams = None,
      Edition.TrainingEdition,
      maybePrefillItemsCap = Some(100),
      MetadataForLogging(
        LocalDate.now(),
        collectionId = None,
        collectionName = None
      )
    )

    val actual = GuardianCapi
      .prepareGetUnsortedPrefillArticleItemsQuery(getPrefillParams)
      .getUrl("")
      .split("&|\\?")
      .sorted

    val expected = ("/content/print-sent" +
      "?order-by=newest" +
      "&page-size=" + GuardianCapiDefaults.MaxPageSize +
      "&tag=theguardian%2Fmainsection%2Ftopstories" +
      "&to-date=2019-10-07T00%3A00%3A00Z" +
      "&use-date=published" +
      "&show-fields=newspaperEditionDate%2CnewspaperPageNumber%2CinternalPageCode" +
      "&show-tags=all" +
      "&from-date=2019-10-04T00%3A00%3A00Z").split("&|\\?").sorted

    actual shouldEqual expected
  }

  behavior of "prepareGetPrefillArticlesQuery"

  it should "prepare query to get ArticleItems for prefill on Suggest Articles request" in {

    val currentPageCodes = List("123", "456")

    val getPrefillParams = PrefillParamsAdapter(
      issueDate,
      contentPrefillQuery,
      CapiPrefillTimeParams(
        contentPrefillTimeWindow,
        CapiDateQueryParam.NewspaperEdition
      ),
      None,
      None,
      Edition.TrainingEdition,
      maybePrefillItemsCap = None,
      MetadataForLogging(
        LocalDate.now(),
        collectionId = None,
        collectionName = None
      )
    )

    val actual = GuardianCapi
      .prepareGetPrefillArticlesQuery(getPrefillParams, currentPageCodes)
      .getUrl("")
      .split("&|\\?")
      .sorted

    val expected = ("/content/print-sent" +
      "?order-by=newest" +
      "&show-elements=images" +
      "&page-size=" + GuardianCapiDefaults.MaxPageSize +
      "&tag=theguardian%2Fmainsection%2Ftopstories" +
      "&to-date=2019-10-07T00%3A00%3A00Z" +
      "&show-atoms=media" +
      "&use-date=newspaper-edition" +
      "&show-fields=newspaperEditionDate%2CnewspaperPageNumber%2CinternalPageCode%2CisLive%2CfirstPublicationDate%2Cheadline%2CtrailText%2Cbyline%2Cthumbnail%2CsecureThumbnail%2CliveBloggingNow%2CmembershipAccess%2CshortUrl" +
      "&show-tags=all" +
      "&show-blocks=main" +
      "&from-date=2019-10-04T00%3A00%3A00Z").split("&|\\?").sorted

    actual shouldEqual (expected)
  }

  behavior of "readAllSearchResponsePages"

  implicit val ctx: ExecutionContext = ExecutionContext.global

  private val ignoredStr = "ignore"
  private val ignoredInt = -1
  private val dummyContent = Content(
    id = ignoredStr,
    webTitle = ignoredStr,
    webUrl = ignoredStr,
    apiUrl = ignoredStr
  )
  private val responseWith3TotalPagesWith2ItemsPerPage = SearchResponse(
    status = ignoredStr,
    userTier = ignoredStr,
    total = 6,
    startIndex = ignoredInt,
    pageSize = 2,
    currentPage = 1,
    pages = 3,
    orderBy = ignoredStr,
    results = Seq(dummyContent, dummyContent)
  )

  private val responseWith1PageWith2ItemsPerPage =
    responseWith3TotalPagesWith2ItemsPerPage.copy(
      total = 2,
      pageSize = 2,
      pages = 1
    )
  private val emptyResponse = responseWith3TotalPagesWith2ItemsPerPage.copy(
    total = 0,
    pageSize = 0,
    pages = 1,
    currentPage = 0,
    results = Nil
  )

  private var getResponseCallsCounter = 0

  override def beforeEach(): Unit = getResponseCallsCounter = 0

  private val genFakeGetResponseFunction = (sr: SearchResponse) =>
    (q: CapiQueryGenerator) => {
      getResponseCallsCounter += 1
      val curPage: Int = q.parameters.getOrElse("page", 1).toString.toInt
      Future.successful(sr.copy(currentPage = curPage))
    }

  private val query = CapiQueryGenerator(PathType.Search)
    .showTags("all")
    .orderBy("newest")
    .page(1)
    .pageSize(2)
    .tag("theguardian/mainsection/topstories")
    .fromDate(
      LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC)
    )
    .toDate(LocalDate.of(2019, 11, 6).atStartOfDay().toInstant(ZoneOffset.UTC))
    .useDate("newspaper-edition")

  it should "read all pages of paginated response" in {
    val getResponse =
      genFakeGetResponseFunction(responseWith3TotalPagesWith2ItemsPerPage)
    val actual = GuardianCapi.readAllSearchResponsePages(query, getResponse)
    actual.map(_.total) shouldEqual List(6, 6, 6)
    actual.map(_.pageSize) shouldEqual List(2, 2, 2)
    actual.map(_.currentPage) shouldEqual List(1, 2, 3)
    actual.map(_.pages) shouldEqual List(3, 3, 3)
    actual.flatMap(_.results).size shouldEqual 6
    getResponseCallsCounter shouldEqual 3
  }

  it should "get response for 1 page search result" in {
    val getResponse =
      genFakeGetResponseFunction(responseWith1PageWith2ItemsPerPage)
    val actual = GuardianCapi.readAllSearchResponsePages(query, getResponse)
    actual.map(_.total) shouldEqual List(2)
    actual.map(_.pageSize) shouldEqual List(2)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.pages) shouldEqual List(1)
    actual.flatMap(_.results).size shouldEqual 2
    getResponseCallsCounter shouldEqual 1
  }

  it should "handle situation if search result pages is 0" in {
    val getResponse = genFakeGetResponseFunction(emptyResponse)
    val actual = GuardianCapi.readAllSearchResponsePages(query, getResponse)

    actual.map(_.total) shouldEqual List(0)
    actual.map(_.pageSize) shouldEqual List(0)
    actual.map(_.currentPage) shouldEqual List(1)
    actual.map(_.pages) shouldEqual List(1)
    actual.flatMap(_.results).size shouldEqual 0

    getResponseCallsCounter shouldEqual 1
  }

}
